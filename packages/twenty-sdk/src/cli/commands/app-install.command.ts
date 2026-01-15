import chalk from 'chalk';
import axios from 'axios';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as os from 'os';
import { TarballService } from '@/cli/services/tarball.service';
import { ApiService } from '@/cli/services/api.service';
import { type ApplicationManifest, type PackageJson } from 'twenty-shared/application';

export type AppInstallOptions = {
  source: string; // URL or local file path
  force?: boolean;
};

export class AppInstallCommand {
  private tarballService = new TarballService();
  private apiService = new ApiService();

  async execute(options: AppInstallOptions): Promise<{
    success: boolean;
    error?: string;
  }> {
    const { source, force: _force } = options;

    try {
      console.log(chalk.blue('📦 Installing Twenty Application'));
      console.log(chalk.gray(`   Source: ${source}`));
      console.log('');

      // Determine if source is URL or local file
      const isUrl = this.isUrl(source);
      let tarballPath: string;
      let shouldCleanup = false;

      if (isUrl) {
        console.log(chalk.gray('  → Downloading tarball...'));
        tarballPath = await this.downloadTarball(source);
        shouldCleanup = true;
      } else {
        // Local file
        if (!(await fs.pathExists(source))) {
          throw new Error(`File not found: ${source}`);
        }
        tarballPath = path.resolve(source);
      }

      try {
        // Extract tarball to temp directory
        console.log(chalk.gray('  → Extracting tarball...'));
        const tempDir = path.join(os.tmpdir(), `twenty-install-${Date.now()}`);

        const extractResult = await this.tarballService.extract({
          tarballPath,
          outputDir: tempDir,
        });

        if (!extractResult.success || !extractResult.extractedDir) {
          throw new Error(extractResult.error ?? 'Failed to extract tarball');
        }

        try {
          // Load manifest and package.json from extracted content
          console.log(chalk.gray('  → Loading manifest...'));
          const { manifest, packageJson, yarnLock } = await this.loadFromExtracted(
            extractResult.extractedDir,
          );

          // Display what will be installed
          this.displayInstallSummary(manifest);

          // Sync with server
          console.log(chalk.gray('  → Installing application...'));
          const syncResult = await this.apiService.syncApplication({
            manifest,
            packageJson,
            yarnLock,
          });

          if (!syncResult.success) {
            throw new Error(
              syncResult.error
                ? typeof syncResult.error === 'string'
                  ? syncResult.error
                  : JSON.stringify(syncResult.error)
                : 'Failed to install application',
            );
          }

          console.log('');
          console.log(chalk.green('✅ Application installed successfully'));
          console.log(
            chalk.gray(`   ${manifest.application.displayName ?? manifest.application.universalIdentifier}`),
          );

          return { success: true };
        } finally {
          // Clean up temp extraction directory
          await fs.remove(tempDir);
        }
      } finally {
        // Clean up downloaded tarball if needed
        if (shouldCleanup) {
          await fs.remove(tarballPath);
        }
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Installation failed:'), errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Check if a string is a URL.
   */
  private isUrl(source: string): boolean {
    try {
      const url = new URL(source);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Download a tarball from a URL to a temp file.
   */
  private async downloadTarball(url: string): Promise<string> {
    const tempPath = path.join(os.tmpdir(), `twenty-download-${Date.now()}.tar.gz`);

    try {
      const response = await axios({
        method: 'GET',
        url,
        responseType: 'stream',
        timeout: 60000, // 60 second timeout
        maxContentLength: 50 * 1024 * 1024, // 50MB max
      });

      const writer = fs.createWriteStream(tempPath);

      await new Promise<void>((resolve, reject) => {
        response.data.pipe(writer);
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      return tempPath;
    } catch (error) {
      // Clean up partial download
      await fs.remove(tempPath).catch(() => {});

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error(`Tarball not found at URL: ${url}`);
        }
        throw new Error(`Failed to download tarball: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Load manifest, package.json, and yarn.lock from extracted tarball.
   */
  private async loadFromExtracted(extractedDir: string): Promise<{
    manifest: ApplicationManifest;
    packageJson: PackageJson;
    yarnLock: string;
  }> {
    const manifestPath = path.join(extractedDir, 'manifest.json');
    const packageJsonPath = path.join(extractedDir, 'package.json');
    const yarnLockPath = path.join(extractedDir, 'yarn.lock');

    if (!(await fs.pathExists(manifestPath))) {
      throw new Error('Invalid tarball: missing manifest.json');
    }

    const manifest = await fs.readJson(manifestPath);

    let packageJson: PackageJson = {
      name: 'unknown',
      version: '0.0.0',
      license: 'UNLICENSED',
      engines: { node: '>=18.0.0', npm: 'please-use-yarn', yarn: '>=4.0.0' },
      packageManager: 'yarn@4.0.0',
    };
    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }

    let yarnLock = '';
    if (await fs.pathExists(yarnLockPath)) {
      yarnLock = await fs.readFile(yarnLockPath, 'utf8');
    }

    return { manifest, packageJson, yarnLock };
  }

  /**
   * Display a summary of what will be installed.
   */
  private displayInstallSummary(manifest: ApplicationManifest): void {
    console.log('');
    console.log(chalk.cyan('Application to install:'));
    console.log(
      chalk.white(
        `  ${manifest.application.displayName ?? manifest.application.universalIdentifier}`,
      ),
    );

    if (manifest.objects.length > 0) {
      console.log(chalk.gray(`  • ${manifest.objects.length} object(s)`));
    }
    if (manifest.objectExtensions && manifest.objectExtensions.length > 0) {
      console.log(
        chalk.gray(`  • ${manifest.objectExtensions.length} object extension(s)`),
      );
    }
    if (manifest.serverlessFunctions.length > 0) {
      console.log(
        chalk.gray(`  • ${manifest.serverlessFunctions.length} function(s)`),
      );
    }
    if (manifest.roles && manifest.roles.length > 0) {
      console.log(chalk.gray(`  • ${manifest.roles.length} role(s)`));
    }
    console.log('');
  }
}
