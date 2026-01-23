import { type ApiResponse } from '@/cli/utilities/api/api-response-type';
import { createLogger } from '@/cli/utilities/build/common/logger';
import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import {
  type ManifestBuildResult,
  runManifestBuild,
  updateManifestChecksum,
} from '@/cli/utilities/build/manifest/manifest-build';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/current-execution-directory';

const initLogger = createLogger('init');

export type AppBuildOptions = {
  appPath?: string;
};

export class AppBuildCommand {
  private functionsBuilder: FunctionsWatcher | null = null;
  private frontComponentsBuilder: FrontComponentsWatcher | null = null;

  private appPath: string = '';

  async execute(
    options: AppBuildOptions,
  ): Promise<ApiResponse<ManifestBuildResult>> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    initLogger.log('🚀 Building Twenty Application');
    initLogger.log(`📁 App Path: ${this.appPath}`);
    console.log('');

    const buildResult = await this.runBuild();

    if (!buildResult) {
      return { success: false, error: 'Build failed' };
    }

    initLogger.success('✅ Build completed successfully');

    return { success: true, data: buildResult };
  }

  private async runBuild(): Promise<ManifestBuildResult | null> {
    const buildResult = await runManifestBuild(this.appPath);

    if (!buildResult.manifest) {
      return null;
    }

    await this.buildFunctions(buildResult);
    await this.buildFrontComponents(buildResult);
    await writeManifestToOutput(this.appPath, buildResult.manifest);
    await this.cleanup();

    return buildResult;
  }

  private async buildFunctions(
    buildResult: ManifestBuildResult,
  ): Promise<void> {
    this.functionsBuilder = new FunctionsWatcher({
      appPath: this.appPath,
      sourcePaths: buildResult.filePaths.functions,
      watch: false,
      onFileBuilt: (_generation, builtPath, checksum) => {
        if (buildResult.manifest) {
          const updatedManifest = updateManifestChecksum({
            manifest: buildResult.manifest,
            entityType: 'function',
            builtPath,
            checksum,
          });

          if (updatedManifest) {
            buildResult.manifest = updatedManifest;
          }
        }
      },
    });

    await this.functionsBuilder.start();
  }

  private async buildFrontComponents(
    buildResult: ManifestBuildResult,
  ): Promise<void> {
    this.frontComponentsBuilder = new FrontComponentsWatcher({
      appPath: this.appPath,
      sourcePaths: buildResult.filePaths.frontComponents,
      watch: false,
      onFileBuilt: (_generation, builtPath, checksum) => {
        if (buildResult.manifest) {
          const updatedManifest = updateManifestChecksum({
            manifest: buildResult.manifest,
            entityType: 'frontComponent',
            builtPath,
            checksum,
          });
          if (updatedManifest) {
            buildResult.manifest = updatedManifest;
          }
        }
      },
    });

    await this.frontComponentsBuilder.start();
  }

  private async cleanup(): Promise<void> {
    await this.functionsBuilder?.close();
    await this.frontComponentsBuilder?.close();
  }
}
