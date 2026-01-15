import * as fs from 'fs-extra';
import * as path from 'path';
import { createGzip, createGunzip } from 'zlib';
import { pipeline } from 'stream/promises';
import { pack, extract } from 'tar-fs';
import chalk from 'chalk';

export type PackOptions = {
  sourceDir: string;
  outputPath?: string;
  appName?: string;
  version?: string;
};

export type PackResult = {
  success: boolean;
  tarballPath?: string;
  error?: string;
};

export type ExtractOptions = {
  tarballPath: string;
  outputDir: string;
};

export type ExtractResult = {
  success: boolean;
  extractedDir?: string;
  error?: string;
};

const TARBALL_ROOT_DIR = 'twenty-app';

export class TarballService {
  /**
   * Create a tarball from a built application directory.
   *
   * The tarball structure:
   * ```
   * app-name-1.0.0.tar.gz
   * └── twenty-app/
   *     ├── manifest.json
   *     ├── package.json
   *     ├── yarn.lock
   *     ├── sources/
   *     └── assets/
   * ```
   */
  async pack(options: PackOptions): Promise<PackResult> {
    const { sourceDir, outputPath, appName, version } = options;

    try {
      // Validate source directory
      if (!(await fs.pathExists(sourceDir))) {
        throw new Error(`Source directory does not exist: ${sourceDir}`);
      }

      // Check for manifest.json to confirm it's a built app
      const manifestPath = path.join(sourceDir, 'manifest.json');
      if (!(await fs.pathExists(manifestPath))) {
        throw new Error(
          'manifest.json not found. Please run `twenty app build` first.',
        );
      }

      // Determine output path
      const finalOutputPath = outputPath ?? await this.generateTarballPath(sourceDir, appName, version);

      console.log(chalk.blue('📦 Creating tarball...'));
      console.log(chalk.gray(`   Source: ${sourceDir}`));
      console.log(chalk.gray(`   Output: ${finalOutputPath}`));

      // Create temporary directory with the expected structure
      const tempDir = path.join(path.dirname(finalOutputPath), '.pack-temp');
      const tempAppDir = path.join(tempDir, TARBALL_ROOT_DIR);

      try {
        await fs.ensureDir(tempAppDir);
        await fs.copy(sourceDir, tempAppDir);

        // Create tarball
        await this.createTarGz(tempDir, finalOutputPath);

        console.log(chalk.green('✅ Tarball created successfully'));
        console.log(chalk.gray(`   ${finalOutputPath}`));

        return {
          success: true,
          tarballPath: finalOutputPath,
        };
      } finally {
        // Clean up temp directory
        await fs.remove(tempDir);
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Pack failed:'), errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Extract a tarball to a directory.
   */
  async extract(options: ExtractOptions): Promise<ExtractResult> {
    const { tarballPath, outputDir } = options;

    try {
      // Validate tarball exists
      if (!(await fs.pathExists(tarballPath))) {
        throw new Error(`Tarball does not exist: ${tarballPath}`);
      }

      console.log(chalk.blue('📦 Extracting tarball...'));
      console.log(chalk.gray(`   Source: ${tarballPath}`));
      console.log(chalk.gray(`   Output: ${outputDir}`));

      await fs.ensureDir(outputDir);

      // Extract tarball
      await this.extractTarGz(tarballPath, outputDir);

      // The extracted content will be in outputDir/twenty-app/
      const extractedDir = path.join(outputDir, TARBALL_ROOT_DIR);

      // Verify extraction
      if (!(await fs.pathExists(extractedDir))) {
        throw new Error('Invalid tarball structure: missing twenty-app directory');
      }

      const manifestPath = path.join(extractedDir, 'manifest.json');
      if (!(await fs.pathExists(manifestPath))) {
        throw new Error('Invalid tarball: missing manifest.json');
      }

      console.log(chalk.green('✅ Tarball extracted successfully'));

      return {
        success: true,
        extractedDir,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(chalk.red('❌ Extract failed:'), errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Read manifest from a tarball without fully extracting.
   */
  async readManifestFromTarball(
    tarballPath: string,
  ): Promise<{ success: boolean; manifest?: unknown; error?: string }> {
    const tempDir = path.join(path.dirname(tarballPath), '.extract-temp');

    try {
      const result = await this.extract({
        tarballPath,
        outputDir: tempDir,
      });

      if (!result.success || !result.extractedDir) {
        return { success: false, error: result.error };
      }

      const manifestPath = path.join(result.extractedDir, 'manifest.json');
      const manifest = await fs.readJson(manifestPath);

      return { success: true, manifest };
    } finally {
      await fs.remove(tempDir);
    }
  }

  /**
   * Generate a tarball filename based on package.json or manifest.
   */
  private async generateTarballPath(
    sourceDir: string,
    appName?: string,
    version?: string,
  ): Promise<string> {
    let name = appName ?? 'twenty-app';
    let ver = version ?? '0.0.0';

    // Try to read from package.json
    const packageJsonPath = path.join(sourceDir, 'package.json');
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      name = appName ?? packageJson.name ?? name;
      ver = version ?? packageJson.version ?? ver;
    }

    // Sanitize name for filename
    const sanitizedName = name.replace(/[^a-zA-Z0-9-_]/g, '-');

    return path.join(
      path.dirname(sourceDir),
      `${sanitizedName}-${ver}.tar.gz`,
    );
  }

  /**
   * Create a .tar.gz file from a directory.
   */
  private async createTarGz(
    sourceDir: string,
    outputPath: string,
  ): Promise<void> {
    await fs.ensureDir(path.dirname(outputPath));

    const tarStream = pack(sourceDir);
    const gzipStream = createGzip();
    const outputStream = fs.createWriteStream(outputPath);

    await pipeline(tarStream, gzipStream, outputStream);
  }

  /**
   * Extract a .tar.gz file to a directory.
   */
  private async extractTarGz(
    tarballPath: string,
    outputDir: string,
  ): Promise<void> {
    const inputStream = fs.createReadStream(tarballPath);
    const gunzipStream = createGunzip();
    const extractStream = extract(outputDir);

    await pipeline(inputStream, gunzipStream, extractStream);
  }
}
