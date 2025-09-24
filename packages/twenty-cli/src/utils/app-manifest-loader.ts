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
    const packageJsonPath = await this.findPackageJsonFile();
    const rawPackageJson = await parseJsoncFile(packageJsonPath);

    // Validate the raw manifest structure
    await schemaValidator.validateAppManifest(rawPackageJson, packageJsonPath);

    return this.discoverAndLoadAgents(rawPackageJson, packageJsonPath);
  }

  private async findPackageJsonFile(): Promise<string> {
    const jsonPath = path.join(this.appPath, 'package.json');

    if (await fs.pathExists(jsonPath)) {
      return jsonPath;
    }

    throw new Error(`package.json not found in ${this.appPath}`);
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
      ...rawManifest,
      agents,
      _meta: {
        agentFiles,
        manifestPath,
      },
    };
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
