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

/**
 * BuildManifestWriter creates the output manifest.json for a built application.
 *
 * The output manifest differs from the source manifest:
 * - `serverlessFunctions[].handlerPath` points to built .js files
 * - `sources` field is removed (replaced by built files)
 */
export class BuildManifestWriter {
  /**
   * Write the built manifest to the output directory.
   *
   * @param manifest - The original application manifest
   * @param builtFunctions - Information about built functions with new paths
   * @param outputDir - The output directory path
   * @returns The path to the written manifest file
   */
  async write(params: {
    manifest: ApplicationManifest;
    builtFunctions: BuiltFunctionInfo[];
    outputDir: string;
  }): Promise<string> {
    const { manifest, builtFunctions, outputDir } = params;

    // Create a map of universalIdentifier -> built handler path
    const builtPathMap = new Map<string, string>();
    for (const fn of builtFunctions) {
      builtPathMap.set(fn.universalIdentifier, fn.builtHandlerPath);
    }

    // Create the output manifest with updated handler paths
    const outputManifest: Omit<ApplicationManifest, 'sources'> = {
      application: manifest.application,
      objects: manifest.objects,
      objectExtensions: manifest.objectExtensions,
      serverlessFunctions: manifest.serverlessFunctions.map((fn) => {
        const builtPath = builtPathMap.get(fn.universalIdentifier);

        if (!builtPath) {
          // If function wasn't built, keep original path (shouldn't happen normally)
          return fn;
        }

        return {
          ...fn,
          // Update handler path to point to the built .js file
          handlerPath: builtPath,
        };
      }),
      roles: manifest.roles,
    };

    const manifestPath = path.join(outputDir, 'manifest.json');

    // Ensure the output directory exists
    await fs.ensureDir(outputDir);

    // Write the manifest with pretty formatting
    await fs.writeJSON(manifestPath, outputManifest, { spaces: 2 });

    return manifestPath;
  }
}
