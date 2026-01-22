import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { createLogger } from '@/cli/utilities/build/common/logger';
import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import {
  type ManifestBuildResult,
  runManifestBuild,
  updateManifestChecksum,
} from '@/cli/utilities/build/manifest/manifest-build';
import { manifestExtractFromFileServer } from '@/cli/utilities/build/manifest/manifest-extract-from-file-server';
import { writeManifestToOutput } from '@/cli/utilities/build/manifest/manifest-writer';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import { ApiService } from '@/cli/utilities/api/services/api.service';
import { FileFolder } from 'twenty-shared/types';
import { join } from 'path';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';

const initLogger = createLogger('init');
const functionLogger = createLogger('functions-watch');

export type AppBuildOptions = {
  appPath?: string;
};

export class AppBuildCommand {
  private functionsBuilder: FunctionsWatcher | null = null;
  private frontComponentsBuilder: FrontComponentsWatcher | null = null;
  private apiService = new ApiService();

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
      onFileBuilt: async (builtPath, checksum) => {
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

          const uploadResult = await this.apiService.uploadFile({
            filePath: join(this.appPath, OUTPUT_DIR, builtPath),
            builtHandlerPath: builtPath,
            fileFolder: FileFolder.BuiltFunction,
            applicationUniversalIdentifier:
              buildResult.manifest.application.universalIdentifier,
          });

          if (uploadResult.success) {
            functionLogger.success(`☁️ Successfully uploaded ${builtPath}`);
          } else {
            functionLogger.error(
              `Failed to upload ${builtPath} -- ${uploadResult.error}`,
            );
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
      onFileBuilt: (builtPath, checksum) => {
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
    await manifestExtractFromFileServer.closeViteServer();
  }
}
