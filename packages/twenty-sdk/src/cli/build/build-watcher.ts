import * as chokidar from 'chokidar';
import path from 'path';
import { type BuildWatcherState, type RebuildDecision } from './types';
import { ASSETS_DIR } from '@/cli/constants/assets-dir';

/**
 * BuildWatcher monitors file changes and triggers rebuilds.
 *
 * State machine:
 * - IDLE: Waiting for changes
 * - ANALYZING: Determining which files changed and what to rebuild
 * - BUILDING: Rebuild in progress
 * - ERROR: Build failed (can recover)
 * - SUCCESS: Build succeeded, returning to IDLE
 */
export class BuildWatcher {
  private state: BuildWatcherState = 'IDLE';
  private watcher: chokidar.FSWatcher | null = null;
  private pendingChanges: Set<string> = new Set();
  private debounceTimer: NodeJS.Timeout | null = null;
  private readonly debounceMs: number;

  constructor(
    private readonly appPath: string,
    debounceMs = 500,
  ) {
    this.debounceMs = debounceMs;
  }

  /**
   * Start watching for file changes.
   */
  async start(
    onRebuild: (decision: RebuildDecision) => Promise<void>,
  ): Promise<void> {
    this.watcher = chokidar.watch(this.appPath, {
      ignored: [
        /node_modules/,
        /\.git/,
        /\.twenty\/output/,
        /\.twenty\/.*\.tar\.gz$/,
        /dist/,
      ],
      persistent: true,
      ignoreInitial: true,
    });

    const handleChange = (filepath: string) => {
      // Only watch TypeScript files and relevant config files
      if (!this.isWatchedFile(filepath)) {
        return;
      }

      this.pendingChanges.add(filepath);

      // Debounce rapid changes
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      this.debounceTimer = setTimeout(async () => {
        const changedFiles = Array.from(this.pendingChanges);
        this.pendingChanges.clear();

        if (changedFiles.length === 0) {
          return;
        }

        this.state = 'ANALYZING';

        const decision = this.analyzeChanges(changedFiles);

        this.state = 'BUILDING';

        try {
          await onRebuild(decision);
          this.state = 'SUCCESS';
        } catch {
          this.state = 'ERROR';
        } finally {
          this.state = 'IDLE';
        }
      }, this.debounceMs);
    };

    this.watcher.on('change', handleChange);
    this.watcher.on('add', handleChange);
    this.watcher.on('unlink', handleChange);
  }

  /**
   * Stop watching for file changes.
   */
  async stop(): Promise<void> {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    if (this.watcher) {
      await this.watcher.close();
      this.watcher = null;
    }

    this.state = 'IDLE';
  }

  /**
   * Check if a file should trigger a rebuild.
   */
  private isWatchedFile(filepath: string): boolean {
    const ext = path.extname(filepath);
    const basename = path.basename(filepath);
    const relativePath = path.relative(this.appPath, filepath);

    // Watch TypeScript files
    if (ext === '.ts' || ext === '.tsx') {
      return true;
    }

    // Watch relevant config files
    if (
      basename === 'package.json' ||
      basename === 'tsconfig.json' ||
      basename === '.env'
    ) {
      return true;
    }

    // Watch asset files in assets/ (at the root of the application)
    const assetsDirPrefix = `${ASSETS_DIR}/`;
    const assetsDirPrefixWin = `${ASSETS_DIR}\\`;
    if (
      relativePath.startsWith(assetsDirPrefix) ||
      relativePath.startsWith(assetsDirPrefixWin)
    ) {
      return true;
    }

    return false;
  }

  /**
   * Analyze changed files to determine what needs to be rebuilt.
   *
   * Manifest is composed from:
   * - src/app/application.config.ts
   * - src/app/**\/*.object.ts
   * - src/app/**\/*.object-extension.ts
   * - src/app/**\/*.role.ts
   * - src/app/**\/*.function.ts (also requires function rebuild)
   */
  private analyzeChanges(changedFiles: string[]): RebuildDecision {
    const affectedFunctions: string[] = [];
    let rebuildGenerated = false;
    let assetsChanged = false;
    let sharedFilesChanged = false;
    let configChanged = false;
    let manifestChanged = false;

    const assetsDirPrefix = `${ASSETS_DIR}/`;

    for (const filepath of changedFiles) {
      const relativePath = path.relative(this.appPath, filepath);
      // Normalize path separators for cross-platform compatibility
      const normalizedPath = relativePath.replace(/\\/g, '/');
      const basename = path.basename(normalizedPath);

      // Check if it's a build config file (requires full rebuild)
      if (
        basename === 'package.json' ||
        basename === 'tsconfig.json' ||
        basename === '.env'
      ) {
        configChanged = true;
        continue;
      }

      // Check if it's an asset file (in root assets/ folder)
      if (normalizedPath.startsWith(assetsDirPrefix)) {
        assetsChanged = true;
        continue;
      }

      // Check if it's in the generated folder
      if (normalizedPath.startsWith('generated/')) {
        rebuildGenerated = true;
        continue;
      }

      // Check if it's a manifest-related file in src/app/
      if (normalizedPath.startsWith('src/app/')) {
        // Function files: rebuild function AND regenerate manifest
        if (normalizedPath.endsWith('.function.ts')) {
          affectedFunctions.push(normalizedPath);
          manifestChanged = true;
          continue;
        }

        // Other manifest files: only regenerate manifest (no function rebuild)
        // - application.config.ts
        // - *.object.ts
        // - *.object-extension.ts
        // - *.role.ts
        if (
          basename === 'application.config.ts' ||
          normalizedPath.endsWith('.object.ts') ||
          normalizedPath.endsWith('.object-extension.ts') ||
          normalizedPath.endsWith('.role.ts')
        ) {
          manifestChanged = true;
          continue;
        }
      }

      // Check if it's a shared file that affects all functions
      if (
        normalizedPath.startsWith('src/') &&
        !normalizedPath.startsWith('src/app/') &&
        (normalizedPath.endsWith('.ts') || normalizedPath.endsWith('.tsx'))
      ) {
        // Shared utility file outside src/app/ - rebuild all functions
        sharedFilesChanged = true;
      }
    }

    return {
      shouldRebuild: true,
      affectedFunctions,
      sharedFilesChanged,
      configChanged,
      manifestChanged,
      rebuildGenerated,
      assetsChanged,
      changedFiles,
    };
  }

  /**
   * Get the current watcher state.
   */
  getState(): BuildWatcherState {
    return this.state;
  }
}
