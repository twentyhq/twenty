import { type ApiResponse } from '@/cli/utilities/api/types/api-response.types';
import { OUTPUT_DIR } from '@/cli/utilities/build/common/constants';
import { createLogger } from '@/cli/utilities/build/common/logger';
import { FrontComponentsWatcher } from '@/cli/utilities/build/front-components/front-component-watcher';
import { FunctionsWatcher } from '@/cli/utilities/build/functions/function-watcher';
import { runManifestBuild, type ManifestBuildResult } from '@/cli/utilities/build/manifest/manifest-build';
import { manifestExtractFromFileServer } from '@/cli/utilities/build/manifest/manifest-extract-from-file-server';
import { CURRENT_EXECUTION_DIRECTORY } from '@/cli/utilities/config/constants/current-execution-directory';
import * as fs from 'fs-extra';
import path from 'path';

const initLogger = createLogger('init');

export type AppBuildOptions = {
  appPath?: string;
};

export class AppBuildCommand {
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

    await this.buildFunctions(buildResult);
    await this.buildFrontComponents(buildResult);

    // Write the manifest with populated checksums
    await this.writeManifestToOutput(buildResult);

    await this.cleanup();

    return buildResult;
  }

  private async buildFunctions(buildResult: ManifestBuildResult): Promise<void> {
    this.functionsBuilder = new FunctionsWatcher({
      appPath: this.appPath,
      buildResult,
      watch: false,
      onFileBuilt: (builtPath, checksum) => {
        this.updateFunctionChecksum(buildResult, builtPath, checksum);
      },
    });

    await this.functionsBuilder.start();
  }

  private async buildFrontComponents(buildResult: ManifestBuildResult): Promise<void> {
    this.frontComponentsBuilder = new FrontComponentsWatcher({
      appPath: this.appPath,
      buildResult,
      watch: false,
      onFileBuilt: (builtPath, checksum) => {
        this.updateFrontComponentChecksum(buildResult, builtPath, checksum);
      },
    });

    await this.frontComponentsBuilder.start();
  }

  private updateFunctionChecksum(
    buildResult: ManifestBuildResult,
    builtPath: string,
    checksum: string,
  ): void {
    const fn = buildResult.manifest?.functions.find(
      (f) => f.builtHandlerPath === builtPath,
    );
    if (fn) {
      fn.builtHandlerChecksum = checksum;
    }
  }

  private updateFrontComponentChecksum(
    buildResult: ManifestBuildResult,
    builtPath: string,
    checksum: string,
  ): void {
    const component = buildResult.manifest?.frontComponents?.find(
      (c) => c.builtComponentPath === builtPath,
    );
    if (component) {
      component.builtComponentChecksum = checksum;
    }
  }

  private async writeManifestToOutput(buildResult: ManifestBuildResult): Promise<void> {
    const manifest = buildResult.manifest;
    if (!manifest) return;

    const outputDir = path.join(this.appPath, OUTPUT_DIR);
    const manifestPath = path.join(outputDir, 'manifest.json');
    await fs.writeJSON(manifestPath, manifest, { spaces: 2 });
  }

  private async cleanup(): Promise<void> {
    await this.functionsBuilder?.close();
    await this.frontComponentsBuilder?.close();
    await manifestExtractFromFileServer.closeViteServer();
  }
}
