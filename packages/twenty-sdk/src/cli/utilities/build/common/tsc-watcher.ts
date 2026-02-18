import { spawn, type ChildProcess } from 'node:child_process';
import * as fs from 'fs-extra';
import path from 'node:path';

import {
  parseTscOutputLine,
  type TypecheckError,
} from '@/cli/utilities/build/common/typecheck-plugin';

export type TscWatcherOptions = {
  appPath: string;
  onErrors: (errors: TypecheckError[]) => void;
};

export class TscWatcher {
  private appPath: string;
  private onErrors: (errors: TypecheckError[]) => void;
  private process: ChildProcess | null = null;
  private pendingErrors: TypecheckError[] = [];
  private buffer = '';
  private hasErrors = false;

  constructor(options: TscWatcherOptions) {
    this.appPath = options.appPath;
    this.onErrors = options.onErrors;
  }

  async start(): Promise<void> {
    const tscPath = path.join(this.appPath, 'node_modules', '.bin', 'tsc');

    if (!(await fs.pathExists(tscPath))) {
      return;
    }

    const tsconfigPath = path.join(this.appPath, 'tsconfig.json');

    this.process = spawn(
      tscPath,
      ['--watch', '--noEmit', '--pretty', 'false', '-p', tsconfigPath],
      { cwd: this.appPath, stdio: ['ignore', 'pipe', 'pipe'] },
    );

    this.process.on('error', () => {
      this.process = null;
    });

    this.process.stdout?.on('data', (chunk: Buffer) => {
      this.handleOutput(chunk.toString());
    });

    this.process.stderr?.on('data', (chunk: Buffer) => {
      this.handleOutput(chunk.toString());
    });
  }

  close(): void {
    this.process?.kill();
    this.process = null;
  }

  private handleOutput(data: string): void {
    this.buffer += data;

    const lines = this.buffer.split('\n');

    this.buffer = lines.pop() ?? '';

    for (const line of lines) {
      this.processLine(line);
    }
  }

  private processLine(line: string): void {
    if (
      line.includes('Starting compilation in watch mode...') ||
      line.includes('Starting incremental compilation...')
    ) {
      this.pendingErrors = [];

      return;
    }

    if (line.includes('Watching for file changes.')) {
      const hadErrors = this.hasErrors;

      this.hasErrors = this.pendingErrors.length > 0;

      if (this.hasErrors || hadErrors) {
        this.onErrors(this.pendingErrors);
      }

      this.pendingErrors = [];

      return;
    }

    const error = parseTscOutputLine(line);

    if (error) {
      this.pendingErrors.push(error);
    }
  }
}
