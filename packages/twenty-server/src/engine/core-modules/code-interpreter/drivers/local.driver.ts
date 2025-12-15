import { spawn } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { basename, join } from 'path';

import { DEFAULT_CODE_INTERPRETER_TIMEOUT_MS } from 'src/engine/core-modules/code-interpreter/code-interpreter.constants';
import { getMimeType } from 'src/engine/core-modules/code-interpreter/utils/get-mime-type.util';

import {
  type CodeExecutionResult,
  type CodeInterpreterDriver,
  type ExecutionContext,
  type InputFile,
  type OutputFile,
  type StreamCallbacks,
} from './interfaces/code-interpreter-driver.interface';

export type LocalDriverOptions = {
  timeoutMs?: number;
};

const SANDBOX_SCRIPTS_PATH = join(__dirname, '..', 'sandbox-scripts');

async function copyDirectoryRecursive(src: string, dest: string) {
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

// WARNING: This driver is UNSAFE and should only be used for development.
// It executes arbitrary Python code on the server without any sandboxing.
export class LocalDriver implements CodeInterpreterDriver {
  constructor(private options: LocalDriverOptions = {}) {}

  async execute(
    code: string,
    files?: InputFile[],
    context?: ExecutionContext,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    const workDir = await fs.mkdtemp(join(tmpdir(), 'code-interpreter-'));
    const outputDir = join(workDir, 'output');
    const scriptsDir = join(workDir, 'scripts');

    await fs.mkdir(outputDir);

    // Copy pre-installed scripts to sandbox
    try {
      await copyDirectoryRecursive(SANDBOX_SCRIPTS_PATH, scriptsDir);
    } catch {
      // Scripts directory might not exist in dev environment
    }

    try {
      for (const file of files ?? []) {
        const safeFilename = basename(file.filename);

        await fs.writeFile(join(workDir, safeFilename), file.content);
      }

      // Rewrite E2B-style paths to local paths for compatibility
      const rewrittenCode = code
        .replace(/\/home\/user\/scripts\//g, `${scriptsDir}/`)
        .replace(/\/home\/user\/scripts/g, scriptsDir)
        .replace(/\/home\/user\/output\//g, `${outputDir}/`)
        .replace(/\/home\/user\/output/g, outputDir)
        .replace(/\/home\/user\//g, `${workDir}/`)
        .replace(/\/home\/user/g, workDir);

      const scriptPath = join(workDir, 'script.py');

      await fs.writeFile(scriptPath, rewrittenCode);

      const timeoutMs =
        this.options.timeoutMs ?? DEFAULT_CODE_INTERPRETER_TIMEOUT_MS;

      const { stdout, stderr, exitCode, error } = await this.runPythonScript(
        scriptPath,
        workDir,
        outputDir,
        context?.env,
        timeoutMs,
        callbacks,
      );

      const outputFiles: OutputFile[] = [];

      try {
        const outputEntries = await fs.readdir(outputDir, {
          withFileTypes: true,
        });

        for (const entry of outputEntries) {
          if (entry.isFile()) {
            const content = await fs.readFile(join(outputDir, entry.name));
            const outputFile: OutputFile = {
              filename: entry.name,
              content,
              mimeType: getMimeType(entry.name),
            };

            outputFiles.push(outputFile);
            callbacks?.onResult?.(outputFile);
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

  private runPythonScript(
    scriptPath: string,
    workDir: string,
    outputDir: string,
    env?: Record<string, string>,
    timeoutMs?: number,
    callbacks?: StreamCallbacks,
  ): Promise<{
    stdout: string;
    stderr: string;
    exitCode: number;
    error?: string;
  }> {
    return new Promise((resolve) => {
      const child = spawn('python3', [scriptPath], {
        cwd: workDir,
        env: {
          ...process.env,
          OUTPUT_DIR: outputDir,
          ...env,
        },
      });

      let stdout = '';
      let stderr = '';
      let killed = false;

      const timeout = setTimeout(() => {
        killed = true;
        child.kill('SIGKILL');
      }, timeoutMs ?? DEFAULT_CODE_INTERPRETER_TIMEOUT_MS);

      child.stdout.on('data', (data: Buffer) => {
        const text = data.toString();

        stdout += text;
        const lines = text.split('\n');

        for (const line of lines) {
          if (line) {
            callbacks?.onStdout?.(line);
          }
        }
      });

      child.stderr.on('data', (data: Buffer) => {
        const text = data.toString();

        stderr += text;
        const lines = text.split('\n');

        for (const line of lines) {
          if (line) {
            callbacks?.onStderr?.(line);
          }
        }
      });

      child.on('close', (code) => {
        clearTimeout(timeout);
        resolve({
          stdout,
          stderr,
          exitCode: code ?? 0,
          error: killed ? 'Process timed out' : undefined,
        });
      });

      child.on('error', (err) => {
        clearTimeout(timeout);
        resolve({
          stdout,
          stderr,
          exitCode: 1,
          error: err.message,
        });
      });
    });
  }
}
