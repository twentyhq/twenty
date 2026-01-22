import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { AssetsWatcher, type BuiltAsset } from '@/cli/utilities/build/assets/assets-watcher';
import { createLogger } from '@/cli/utilities/build/common/logger';
import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import {
  runManifestBuild,
  updateManifestAssets,
  updateManifestChecksum,
  type ManifestBuildResult,
} from '@/cli/utilities/build/manifest/manifest-build';
import { manifestExtractFromFileServer } from '@/cli/utilities/build/manifest/manifest-extract-from-file-server';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';

const initLogger = createLogger('init');

export type AppBuildOptions = {
  appPath?: string;
};

export class AppBuildCommand {
  private assetsBuilder: AssetsWatcher | null = null;
  private functionsBuilder: FunctionsWatcher | null = null;
  private frontComponentsBuilder: FrontComponentsWatcher | null = null;

  private appPath: string = '';

  async execute(options: AppBuildOptions): Promise<ApiResponse<null>> {
    this.appPath = options.appPath ?? CURRENT_EXECUTION_DIRECTORY;

    initLogger.log('🚀 Building Twenty Application');
    initLogger.log(`📁 App Path: ${this.appPath}`);
    console.log('');

    const buildResult = await this.runBuild();

    if (!buildResult) {
      return { success: false, error: 'Build failed' };
    }

    initLogger.success('✅ Build completed successfully');

    return { success: true, data: null };
  }

  private async runBuild(): Promise<ManifestBuildResult | null> {
    const buildResult = await runManifestBuild(this.appPath);

    if (!buildResult.manifest) {
      return null;
    }

    // Build assets first so they're available for functions and front components
    await this.buildAssets();
    await this.buildFunctions(buildResult);
    await this.buildFrontComponents(buildResult);
    await writeManifestToOutput(this.appPath, buildResult.manifest);
    await this.cleanup();

    return buildResult;
  }

  private async buildAssets(): Promise<void> {
    this.assetsBuilder = new AssetsWatcher({
      appPath: this.appPath,
      watch: false,
    });

    await this.assetsBuilder.start();
  }

  private async buildFunctions(buildResult: ManifestBuildResult): Promise<void> {
    const assetsWatcher = this.assetsBuilder;

    this.functionsBuilder = new FunctionsWatcher({
      appPath: this.appPath,
      sourcePaths: buildResult.filePaths.functions,
      watch: false,
      onFileBuilt: (builtPath: string, checksum: string, sourceAssetPaths: string[]) => {
        if (buildResult.manifest) {
          let updatedManifest = updateManifestChecksum({
            manifest: buildResult.manifest,
            entityType: 'function',
            builtPath,
            checksum,
          });

          if (updatedManifest && sourceAssetPaths.length > 0 && assetsWatcher) {
            const builtAssets = this.resolveBuiltAssets(assetsWatcher, sourceAssetPaths);
            updatedManifest = updateManifestAssets({
              manifest: updatedManifest,
              entityType: 'function',
              builtPath,
              assets: builtAssets,
            });
          }

          if (updatedManifest) {
            buildResult.manifest = updatedManifest;
          }
        }
      },
    });

    await this.functionsBuilder.start();
  }

  private async buildFrontComponents(buildResult: ManifestBuildResult): Promise<void> {
    const assetsWatcher = this.assetsBuilder;

    this.frontComponentsBuilder = new FrontComponentsWatcher({
      appPath: this.appPath,
      sourcePaths: buildResult.filePaths.frontComponents,
      watch: false,
      onFileBuilt: (builtPath: string, checksum: string, sourceAssetPaths: string[]) => {
        if (buildResult.manifest) {
          let updatedManifest = updateManifestChecksum({
            manifest: buildResult.manifest,
            entityType: 'frontComponent',
            builtPath,
            checksum,
          });

          if (updatedManifest && sourceAssetPaths.length > 0 && assetsWatcher) {
            const builtAssets = this.resolveBuiltAssets(assetsWatcher, sourceAssetPaths);
            updatedManifest = updateManifestAssets({
              manifest: updatedManifest,
              entityType: 'frontComponent',
              builtPath,
              assets: builtAssets,
            });
          }

          if (updatedManifest) {
            buildResult.manifest = updatedManifest;
          }
        }
      },
    });

    await this.frontComponentsBuilder.start();
  }

  private resolveBuiltAssets(assetsWatcher: AssetsWatcher, sourceAssetPaths: string[]): BuiltAsset[] {
    const builtAssets: BuiltAsset[] = [];

    for (const sourceAssetPath of sourceAssetPaths) {
      const builtAsset = assetsWatcher.getBuiltAsset(sourceAssetPath);
      if (builtAsset) {
        builtAssets.push(builtAsset);
      }
    }

    return builtAssets;
  }

  private async cleanup(): Promise<void> {
    await this.assetsBuilder?.close();
    await this.functionsBuilder?.close();
    await this.frontComponentsBuilder?.close();
    await manifestExtractFromFileServer.closeViteServer();
  }
}
