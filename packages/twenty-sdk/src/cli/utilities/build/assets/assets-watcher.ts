import chokidar, { type FSWatcher } from 'chokidar';
import crypto from 'crypto';
import { glob } from 'fast-glob';
import * as fs from 'fs-extra';
import path from 'path';
import { OUTPUT_DIR } from '../common/constants';
import { createLogger } from '../common/logger';
import { ASSETS_DIR, STATIC_ASSET_EXTENSIONS } from './constants';

const logger = createLogger('assets-watch');

export type BuiltAsset = {
  sourceAssetPath: string;
  builtAssetPath: string;
  builtAssetChecksum: string;
};

export type OnAssetBuiltCallback = (asset: BuiltAsset) => void;

export type AssetsWatcherOptions = {
  appPath: string;
  watch?: boolean;
  onAssetBuilt?: OnAssetBuiltCallback;
};

export class AssetsWatcher {
  private appPath: string;
  private watchMode: boolean;
  private watcher: FSWatcher | null = null;
  private onAssetBuilt?: OnAssetBuiltCallback;
  private assetChecksums: Map<string, string> = new Map();
  private builtAssets: Map<string, BuiltAsset> = new Map();

  constructor(options: AssetsWatcherOptions) {
    this.appPath = options.appPath;
    this.watchMode = options.watch ?? true;
    this.onAssetBuilt = options.onAssetBuilt;
  }

  async start(): Promise<void> {
    const outputDir = path.join(this.appPath, OUTPUT_DIR, ASSETS_DIR);
    await fs.emptyDir(outputDir);

    // Build all existing assets
    await this.buildAllAssets();

    if (this.watchMode) {
      await this.startWatching();
    }
  }

  async close(): Promise<void> {
    await this.watcher?.close();
    this.watcher = null;
  }

  getBuiltAssets(): Map<string, BuiltAsset> {
    return this.builtAssets;
  }

  getBuiltAsset(sourceAssetPath: string): BuiltAsset | undefined {
    return this.builtAssets.get(sourceAssetPath);
  }

  private async buildAllAssets(): Promise<void> {
    const assetPatterns = STATIC_ASSET_EXTENSIONS.map((ext) => `**/*${ext}`);
    const assetFiles = await glob(assetPatterns, {
      cwd: this.appPath,
      ignore: ['**/node_modules/**', '**/dist/**', '**/.twenty/**'],
    });

    if (assetFiles.length === 0) {
      logger.log('No assets found');
      if (this.watchMode) {
        logger.log('👀 Watching for assets...');
      }
      return;
    }

    logger.log(`🖼️  Building ${assetFiles.length} asset(s)...`);

    for (const assetFile of assetFiles) {
      await this.buildAsset(assetFile);
    }

    logger.success(`✓ Built ${assetFiles.length} asset(s)`);

    if (this.watchMode) {
      logger.log('👀 Watching for assets...');
    }
  }

  private async buildAsset(sourceAssetPath: string): Promise<BuiltAsset | null> {
    const absoluteSourcePath = path.join(this.appPath, sourceAssetPath);
    const outputDir = path.join(this.appPath, OUTPUT_DIR, ASSETS_DIR);

    try {
      const content = await fs.readFile(absoluteSourcePath);
      const checksum = crypto.createHash('md5').update(content).digest('hex');

      // Check if asset has changed
      const lastChecksum = this.assetChecksums.get(sourceAssetPath);
      if (lastChecksum === checksum) {
        return this.builtAssets.get(sourceAssetPath) ?? null;
      }

      // Build output path with hash for cache busting
      const ext = path.extname(sourceAssetPath);
      const baseName = path.basename(sourceAssetPath, ext);
      const shortHash = checksum.slice(0, 8).toUpperCase();
      const outputFileName = `${baseName}-${shortHash}${ext}`;
      const outputPath = path.join(outputDir, outputFileName);

      // Copy asset to output
      await fs.copy(absoluteSourcePath, outputPath);

      const builtAssetPath = `${ASSETS_DIR}/${outputFileName}`;
      const builtAsset: BuiltAsset = {
        sourceAssetPath,
        builtAssetPath,
        builtAssetChecksum: checksum,
      };

      this.assetChecksums.set(sourceAssetPath, checksum);
      this.builtAssets.set(sourceAssetPath, builtAsset);

      this.onAssetBuilt?.(builtAsset);

      return builtAsset;
    } catch (error) {
      logger.error(`Failed to build asset ${sourceAssetPath}: ${error}`);
      return null;
    }
  }

  private async startWatching(): Promise<void> {
    const assetPatterns = STATIC_ASSET_EXTENSIONS.map(
      (ext) => path.join(this.appPath, '**', `*${ext}`),
    );

    this.watcher = chokidar.watch(assetPatterns, {
      ignored: [
        '**/node_modules/**',
        '**/.twenty/**',
        '**/dist/**',
      ],
      ignoreInitial: true,
      awaitWriteFinish: {
        stabilityThreshold: 100,
        pollInterval: 50,
      },
    });

    this.watcher.on('add', async (filePath) => {
      const relativePath = path.relative(this.appPath, filePath);
      logger.log(`Asset added: ${relativePath}`);
      const builtAsset = await this.buildAsset(relativePath);
      if (builtAsset) {
        logger.success(`✓ Built ${relativePath}`);
      }
    });

    this.watcher.on('change', async (filePath) => {
      const relativePath = path.relative(this.appPath, filePath);
      logger.log(`Asset changed: ${relativePath}`);
      const builtAsset = await this.buildAsset(relativePath);
      if (builtAsset) {
        logger.success(`✓ Rebuilt ${relativePath}`);
      }
    });

    this.watcher.on('unlink', async (filePath) => {
      const relativePath = path.relative(this.appPath, filePath);
      logger.log(`Asset removed: ${relativePath}`);

      const builtAsset = this.builtAssets.get(relativePath);
      if (builtAsset) {
        const outputPath = path.join(this.appPath, OUTPUT_DIR, builtAsset.builtAssetPath);
        await fs.remove(outputPath);
        this.builtAssets.delete(relativePath);
        this.assetChecksums.delete(relativePath);
      }
    });
  }
}
