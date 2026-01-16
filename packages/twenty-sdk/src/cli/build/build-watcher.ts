import * as chokidar from 'chokidar';
import path from 'path';
import { type BuildWatcherState, type RebuildDecision } from './types';

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

    return false;
  }

  /**
   * Analyze changed files to determine what needs to be rebuilt.
   */
  private analyzeChanges(changedFiles: string[]): RebuildDecision {
    const affectedFunctions: string[] = [];
    let rebuildGenerated = false;

    for (const filepath of changedFiles) {
      const relativePath = path.relative(this.appPath, filepath);

      // Check if it's a function file
      if (
        relativePath.includes('src/app/') &&
        relativePath.endsWith('.function.ts')
      ) {
        const functionName = path.basename(relativePath, '.function.ts');
        affectedFunctions.push(functionName);
      }

      // Check if it's in the generated folder
      if (relativePath.startsWith('generated/')) {
        rebuildGenerated = true;
      }

      // Check if it's a shared file that affects all functions
      if (
        relativePath.includes('src/') &&
        !relativePath.includes('.function.ts') &&
        !relativePath.startsWith('generated/')
      ) {
        // Shared utility file - rebuild all functions
        // For simplicity, we just mark that a rebuild is needed
        // The build service will handle the full rebuild
      }
    }

    return {
      shouldRebuild: true,
      affectedFunctions,
      rebuildGenerated,
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
