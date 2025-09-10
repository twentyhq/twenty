import * as fs from 'fs-extra';
import * as path from 'path';
import { AgentManifest, AppManifest } from '../types/config.types';
import { parseJsoncFile } from './jsonc-parser';
import { schemaValidator } from './schema-validator';

export interface AppManifestWithMeta extends AppManifest {
  _meta?: {
    agentFiles?: string[];
    manifestPath?: string;
  };
}

export type AppManifestRaw = Omit<AppManifest, 'agents'> & {
  // agents will be discovered from the agents/ folder
  agents?: AgentManifest[];
};

export class AppManifestLoader {
  private appPath: string;

  constructor(appPath: string) {
    this.appPath = appPath;
  }

  async loadManifest(): Promise<AppManifestWithMeta> {
    const manifestPath = await this.findManifestFile();
    const rawManifest = await parseJsoncFile(manifestPath);

    // Validate the raw manifest structure
    await schemaValidator.validateAppManifest(rawManifest, manifestPath);

    return this.discoverAndLoadAgents(rawManifest, manifestPath);
  }

  private async findManifestFile(): Promise<string> {
    // Try JSONC first, then fall back to JSON for backward compatibility
    const jsoncPath = path.join(this.appPath, 'twenty-app.jsonc');
    const jsonPath = path.join(this.appPath, 'twenty-app.json');

    if (await fs.pathExists(jsoncPath)) {
      return jsoncPath;
    }

    if (await fs.pathExists(jsonPath)) {
      return jsonPath;
    }

    throw new Error(
      `No manifest file found. Expected twenty-app.jsonc or twenty-app.json in ${this.appPath}`,
    );
  }

  private async discoverAndLoadAgents(
    rawManifest: AppManifestRaw,
    manifestPath: string,
  ): Promise<AppManifestWithMeta> {
    const agentsDir = path.join(this.appPath, 'agents');
    const agentFiles: string[] = [];
    const agents: AgentManifest[] = [];

    // Check if agents directory exists
    if (await fs.pathExists(agentsDir)) {
      const files = await fs.readdir(agentsDir);
      const agentFileNames = files.filter(
        (file) => file.endsWith('.jsonc') || file.endsWith('.json'),
      );

      for (const fileName of agentFileNames) {
        const agentPath = path.join(agentsDir, fileName);
        const agentManifest = await parseJsoncFile(agentPath);

        // Validate the agent against schema
        await schemaValidator.validateAgent(agentManifest, agentPath);

        agents.push(agentManifest);
        agentFiles.push(`agents/${fileName}`);
      }
    }

    return {
      standardId: rawManifest.standardId,
      label: rawManifest.label,
      description: rawManifest.description,
      icon: rawManifest.icon,
      version: rawManifest.version,
      agents,
      _meta: {
        agentFiles,
        manifestPath,
      },
    };
  }

  // Utility method to split agents from an existing manifest
  static async splitAgentsFromManifest(
    appPath: string,
    options: {
      agentsDir?: string;
      preserveOriginal?: boolean;
    } = {},
  ): Promise<void> {
    const loader = new AppManifestLoader(appPath);
    const manifest = await loader.loadManifest();

    const agentsDir = options.agentsDir || 'agents';
    const agentsDirPath = path.join(appPath, agentsDir);

    // Create agents directory
    await fs.ensureDir(agentsDirPath);

    // Extract agents to separate files
    for (const agent of manifest.agents) {
      const agentFileName = `${agent.name}.jsonc`;
      const agentFilePath = path.join(agentsDirPath, agentFileName);

      // Write agent to separate file
      await fs.writeFile(agentFilePath, JSON.stringify(agent, null, 2), 'utf8');
    }

    // Update main manifest (remove agents array since they're now discovered)
    const updatedManifest = {
      standardId: manifest.standardId,
      label: manifest.label,
      description: manifest.description,
      icon: manifest.icon,
      version: manifest.version,
      // No agents array - they will be discovered from the agents/ folder
    };

    // Write updated manifest as JSONC
    const newManifestPath = path.join(appPath, 'twenty-app.jsonc');
    await fs.writeFile(
      newManifestPath,
      JSON.stringify(updatedManifest, null, 2),
      'utf8',
    );

    // Optionally remove original JSON file
    if (!options.preserveOriginal) {
      const oldManifestPath = path.join(appPath, 'twenty-app.json');
      if (await fs.pathExists(oldManifestPath)) {
        await fs.remove(oldManifestPath);
      }
    }
  }
}

// Convenience function for backward compatibility
export const loadAppManifest = async (
  appPath: string,
): Promise<AppManifest> => {
  const loader = new AppManifestLoader(appPath);
  const manifest = await loader.loadManifest();

  // Remove meta information for backward compatibility
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { _meta, ...cleanManifest } = manifest;
  return cleanManifest;
};
