import { type ChildProcess, spawn } from 'child_process';
import { promises as fs } from 'fs';
import { tmpdir } from 'os';
import { basename, join } from 'path';
import { type Readable, type Writable } from 'stream';

import { isDefined } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { DEFAULT_CODE_INTERPRETER_TIMEOUT_MS } from 'src/engine/core-modules/code-interpreter/code-interpreter.constants';
import { LOCAL_DRIVER_PERSISTENT_KERNEL_SCRIPT } from 'src/engine/core-modules/code-interpreter/drivers/local-driver-kernel.const';
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
  idleTimeoutMs?: number;
};

const SANDBOX_SCRIPTS_PATH = join(__dirname, '..', 'sandbox-scripts');

type KernelResponse = {
  stdout: string;
  stderr: string;
  exitCode: number;
};

// A long-lived per-session Python process. Its namespace is reused across
// calls so user variables/imports persist; its work dir is reused so files
// written (and input files) survive between calls.
type LocalSession = {
  workDir: string;
  outputDir: string;
  scriptsDir: string;
  child: ChildProcess;
  controlIn: Writable;
  controlOut: Readable;
  controlBuffer: string;
  pending?: {
    resolve: (response: KernelResponse) => void;
    reject: (error: Error) => void;
  };
  hasExited: boolean;
};

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

const buildEnvSetup = (env?: Record<string, string>): string => {
  if (!isDefined(env)) {
    return '';
  }

  const assignments = Object.entries(env)
    .map(([key, value]) => {
      const escapedValue = value
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r');

      return `os.environ['${key}'] = '${escapedValue}'`;
    })
    .join('\n');

  return `import os\n${assignments}\n\n`;
};

// WARNING: This driver is UNSAFE and should only be used for development.
// It executes arbitrary Python code on the server without any sandboxing.
export class LocalDriver implements CodeInterpreterDriver {
  private readonly sessions = new Map<string, LocalSession>();

  constructor(private options: LocalDriverOptions = {}) {}

  async execute(
    code: string,
    files?: InputFile[],
    context?: ExecutionContext,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    if (isDefined(context?.sessionId)) {
      return this.executeInSession(
        context.sessionId,
        code,
        files,
        context,
        callbacks,
      );
    }

    return this.executeEphemeral(code, files, context, callbacks);
  }

  // Persistent path: reuse a per-session process + work dir so state survives
  // between calls (variables, imports, files).
  private async executeInSession(
    sessionId: string,
    code: string,
    files: InputFile[] | undefined,
    context: ExecutionContext | undefined,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    const session = await this.getOrCreateSession(sessionId, context?.env);

    // /home/user/output is cleared at the start of every call (matching the E2B
    // behavior and the tool contract).
    await fs.rm(session.outputDir, { recursive: true, force: true });
    await fs.mkdir(session.outputDir, { recursive: true });

    for (const file of files ?? []) {
      const safeFilename = basename(file.filename);

      await fs.writeFile(join(session.workDir, safeFilename), file.content);
    }

    const rewrittenCode = this.rewriteSandboxPaths(
      code,
      session.workDir,
      session.scriptsDir,
      session.outputDir,
    );

    const submission = buildEnvSetup(context?.env) + rewrittenCode;
    const timeoutMs =
      this.options.timeoutMs ?? DEFAULT_CODE_INTERPRETER_TIMEOUT_MS;

    let response: KernelResponse;

    try {
      response = await this.runInSession(session, submission, timeoutMs);
    } catch (error) {
      // A timeout or a dead kernel: kill the (possibly wedged) process so the
      // next call recreates a clean one. The 'exit' handler reclaims the work
      // dir.
      session.hasExited = true;
      this.sessions.delete(sessionId);
      session.child.kill('SIGKILL');

      return {
        stdout: '',
        stderr: error instanceof Error ? error.message : String(error),
        exitCode: 1,
        files: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }

    this.streamCaptured(response, callbacks);

    const outputFiles = await this.collectOutputFiles(
      session.outputDir,
      callbacks,
    );

    return {
      stdout: response.stdout,
      stderr: response.stderr,
      exitCode: response.exitCode,
      files: outputFiles,
    };
  }

  // Ephemeral path (no session): fresh work dir + process per call, cleaned up
  // afterwards. State does NOT persist between calls here.
  private async executeEphemeral(
    code: string,
    files: InputFile[] | undefined,
    context: ExecutionContext | undefined,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    const workDir = await fs.mkdtemp(join(tmpdir(), 'code-interpreter-'));
    const outputDir = join(workDir, 'output');
    const scriptsDir = join(workDir, 'scripts');

    await fs.mkdir(outputDir);

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

      const rewrittenCode = this.rewriteSandboxPaths(
        code,
        workDir,
        scriptsDir,
        outputDir,
      );

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

      const outputFiles = await this.collectOutputFiles(outputDir, callbacks);

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

  private rewriteSandboxPaths(
    code: string,
    workDir: string,
    scriptsDir: string,
    outputDir: string,
  ): string {
    // Rewrite E2B-style paths to local paths for compatibility
    return code
      .replace(/\/home\/user\/scripts\//g, `${scriptsDir}/`)
      .replace(/\/home\/user\/scripts/g, scriptsDir)
      .replace(/\/home\/user\/output\//g, `${outputDir}/`)
      .replace(/\/home\/user\/output/g, outputDir)
      .replace(/\/home\/user\//g, `${workDir}/`)
      .replace(/\/home\/user/g, workDir);
  }

  private async collectOutputFiles(
    outputDir: string,
    callbacks?: StreamCallbacks,
  ): Promise<OutputFile[]> {
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
          await callbacks?.onResult?.(outputFile);
        }
      }
    } catch {
      // Output directory might be empty or not exist
    }

    return outputFiles;
  }

  private streamCaptured(
    response: KernelResponse,
    callbacks?: StreamCallbacks,
  ): void {
    for (const line of response.stdout.split('\n')) {
      if (line) {
        callbacks?.onStdout?.(line);
      }
    }

    for (const line of response.stderr.split('\n')) {
      if (line) {
        callbacks?.onStderr?.(line);
      }
    }
  }

  private async getOrCreateSession(
    sessionId: string,
    env?: Record<string, string>,
  ): Promise<LocalSession> {
    const existing = this.sessions.get(sessionId);

    if (isDefined(existing) && !existing.hasExited) {
      return existing;
    }

    if (isDefined(existing)) {
      this.sessions.delete(sessionId);
    }

    const sessionDirName = `code-interpreter-session-${sessionId}-${uuidv4()}`;
    const workDir = join(tmpdir(), sessionDirName);
    const outputDir = join(workDir, 'output');
    const scriptsDir = join(workDir, 'scripts');

    await fs.mkdir(outputDir, { recursive: true });

    try {
      await copyDirectoryRecursive(SANDBOX_SCRIPTS_PATH, scriptsDir);
    } catch {
      // Scripts directory might not exist in dev environment
    }

    const kernelPath = join(workDir, 'kernel.py');

    await fs.writeFile(kernelPath, LOCAL_DRIVER_PERSISTENT_KERNEL_SCRIPT);

    const child = spawn('python3', ['-u', kernelPath], {
      cwd: workDir,
      env: {
        ...process.env,
        OUTPUT_DIR: outputDir,
        KERNEL_IDLE_TIMEOUT_MS: String(this.options.idleTimeoutMs ?? 0),
        ...env,
      },
      stdio: ['ignore', 'ignore', 'pipe', 'pipe', 'pipe'],
    });

    const controlIn = child.stdio[3] as Writable;
    const controlOut = child.stdio[4] as Readable;

    const session: LocalSession = {
      workDir,
      outputDir,
      scriptsDir,
      child,
      controlIn,
      controlOut,
      controlBuffer: '',
      hasExited: false,
    };

    controlOut.on('data', (chunk: Buffer) => {
      session.controlBuffer += chunk.toString();

      let newlineIndex = session.controlBuffer.indexOf('\n');

      while (newlineIndex >= 0) {
        const line = session.controlBuffer.slice(0, newlineIndex);

        session.controlBuffer = session.controlBuffer.slice(newlineIndex + 1);

        if (line.trim().length > 0 && isDefined(session.pending)) {
          const pending = session.pending;

          session.pending = undefined;

          try {
            pending.resolve(JSON.parse(line) as KernelResponse);
          } catch (error) {
            pending.reject(
              error instanceof Error ? error : new Error(String(error)),
            );
          }
        }

        newlineIndex = session.controlBuffer.indexOf('\n');
      }
    });

    const markExited = () => {
      session.hasExited = true;
      this.sessions.delete(sessionId);
      session.pending?.reject(new Error('Python kernel process exited'));
      session.pending = undefined;
      // The kernel self-terminates (idle watchdog) or dies on its own; reclaim
      // its work dir here so it doesn't leak.
      void fs.rm(workDir, { recursive: true, force: true }).catch(() => {});
    };

    child.on('exit', markExited);
    child.on('error', markExited);

    this.sessions.set(sessionId, session);

    return session;
  }

  private runInSession(
    session: LocalSession,
    submission: string,
    timeoutMs: number,
  ): Promise<KernelResponse> {
    return new Promise<KernelResponse>((resolve, reject) => {
      const timeout = setTimeout(() => {
        if (session.pending) {
          session.pending = undefined;
          reject(new Error('Process timed out'));
        }
      }, timeoutMs);

      session.pending = {
        resolve: (response) => {
          clearTimeout(timeout);
          resolve(response);
        },
        reject: (error) => {
          clearTimeout(timeout);
          reject(error);
        },
      };

      const payload =
        JSON.stringify({
          code: Buffer.from(submission, 'utf-8').toString('base64'),
        }) + '\n';

      session.controlIn.write(payload, (error) => {
        if (isDefined(error) && session.pending) {
          session.pending = undefined;
          clearTimeout(timeout);
          reject(error);
        }
      });
    });
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
