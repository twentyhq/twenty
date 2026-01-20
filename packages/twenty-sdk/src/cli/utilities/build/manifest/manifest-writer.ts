import * as fs from 'fs-extra';
import path from 'path';
import { type ApplicationManifest } from 'twenty-shared/application';

export type BuiltFunctionInfo = {
  name: string;
  universalIdentifier: string;
  originalHandlerPath: string;
  builtHandlerPath: string;
  sourceMapPath?: string;
};

export class BuildManifestWriter {
  async write(params: {
    manifest: ApplicationManifest;
    builtFunctions: BuiltFunctionInfo[];
    outputDir: string;
  }): Promise<string> {
    const { manifest, builtFunctions, outputDir } = params;

    const builtPathMap = new Map<string, string>();
    for (const fn of builtFunctions) {
      builtPathMap.set(fn.universalIdentifier, fn.builtHandlerPath);
    }

    const outputManifest: Omit<ApplicationManifest, 'sources'> = {
      application: manifest.application,
      objects: manifest.objects,
      objectExtensions: manifest.objectExtensions,
      serverlessFunctions: manifest.serverlessFunctions.map((fn) => {
        const builtPath = builtPathMap.get(fn.universalIdentifier);

        if (!builtPath) {
          return fn;
        }

        return {
          ...fn,
          handlerPath: builtPath,
        };
      }),
      roles: manifest.roles,
    };

    const manifestPath = path.join(outputDir, 'manifest.json');

    await fs.ensureDir(outputDir);

    await fs.writeJSON(manifestPath, outputManifest, { spaces: 2 });

    return manifestPath;
  }
}
