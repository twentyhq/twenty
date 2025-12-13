import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

import {
  type CodeExecutionResult,
  type CodeInterpreterDriver,
  type InputFile,
  type OutputFile,
} from './interfaces/code-interpreter-driver.interface';

const execAsync = promisify(exec);

export type LocalDriverOptions = {
  timeoutMs?: number;
};

// WARNING: This driver is UNSAFE and should only be used for development.
// It executes arbitrary Python code on the server without any sandboxing.
export class LocalDriver implements CodeInterpreterDriver {
  constructor(private options: LocalDriverOptions = {}) {}

  async execute(
    code: string,
    files?: InputFile[],
  ): Promise<CodeExecutionResult> {
    const workDir = await fs.mkdtemp(join(tmpdir(), 'code-interpreter-'));
    const outputDir = join(workDir, 'output');

    await fs.mkdir(outputDir);

    try {
      // Write input files to working directory
      for (const file of files ?? []) {
        await fs.writeFile(join(workDir, file.filename), file.content);
      }

      // Rewrite E2B-style paths to local paths
      // This allows code written for E2B to work locally
      const rewrittenCode = code
        .replace(/\/home\/user\/output\//g, `${outputDir}/`)
        .replace(/\/home\/user\/output/g, outputDir)
        .replace(/\/home\/user\//g, `${workDir}/`)
        .replace(/\/home\/user/g, workDir);

      const scriptPath = join(workDir, 'script.py');

      await fs.writeFile(scriptPath, rewrittenCode);

      const timeoutMs = this.options.timeoutMs ?? 300_000;

      let stdout = '';
      let stderr = '';
      let exitCode = 0;
      let error: string | undefined;

      try {
        const result = await execAsync(`python3 "${scriptPath}"`, {
          cwd: workDir,
          timeout: timeoutMs,
          env: {
            ...process.env,
            OUTPUT_DIR: outputDir,
          },
        });

        stdout = result.stdout;
        stderr = result.stderr;
      } catch (execError) {
        const err = execError as {
          code?: number;
          stdout?: string;
          stderr?: string;
          message?: string;
        };

        exitCode = err.code ?? 1;
        stdout = err.stdout ?? '';
        stderr = err.stderr ?? '';
        error = err.message;
      }

      const outputFiles: OutputFile[] = [];

      try {
        const outputEntries = await fs.readdir(outputDir, {
          withFileTypes: true,
        });

        for (const entry of outputEntries) {
          if (entry.isFile()) {
            const content = await fs.readFile(join(outputDir, entry.name));

            outputFiles.push({
              filename: entry.name,
              content,
              mimeType: this.getMimeType(entry.name),
            });
          }
        }
      } catch {
        // Output directory might be empty or not exist
      }

      return {
        stdout,
        stderr,
        exitCode,
        files: outputFiles,
        error,
      };
    } finally {
      await fs.rm(workDir, { recursive: true, force: true });
    }
  }

  private getMimeType(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      csv: 'text/csv',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      pdf: 'application/pdf',
      json: 'application/json',
      txt: 'text/plain',
    };

    return mimeTypes[ext ?? ''] ?? 'application/octet-stream';
  }
}
