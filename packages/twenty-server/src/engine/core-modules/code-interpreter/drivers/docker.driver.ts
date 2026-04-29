import {
  chmod,
  mkdir,
  mkdtemp,
  readFile,
  readdir,
  rm,
  writeFile,
} from 'node:fs/promises';
import { basename, join } from 'node:path';
import { PassThrough } from 'node:stream';

import Dockerode from 'dockerode';

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

export type DockerDriverOptions = {
  image: string;
  workDirRoot: string;
  network?: string;
  memoryMb?: number;
  pidsLimit?: number;
  // Docker runtime name (e.g. 'runsc' for gVisor, 'sysbox-runc' for Sysbox).
  // When undefined, the daemon's default runtime is used.
  runtime?: string;
  timeoutMs?: number;
};

const CONTAINER_WORK_DIR = '/home/user';
const OUTPUT_SUBDIR = 'output';

// Caller-provided filenames are written verbatim to the host work dir, so a
// value containing '..' or path separators would escape the sandbox staging
// area. Require a single basename without traversal sequences or NUL bytes.
const assertSafeInputFilename = (filename: string): void => {
  if (
    !filename ||
    filename === '.' ||
    filename === '..' ||
    filename !== basename(filename) ||
    filename.includes('\0')
  ) {
    throw new Error(
      `Invalid input filename ${JSON.stringify(
        filename,
      )}: must be a single path component without traversal sequences`,
    );
  }
};

// Lines that arrive on stdout/stderr are invoked on the consumer's callbacks
// so the UI can stream tokens as they appear. We buffer partial lines across
// chunks so a line split across two reads is still delivered once.
class LineEmitter {
  private buf = '';
  constructor(private readonly emit?: (line: string) => void) {}

  push(chunk: Buffer) {
    this.buf += chunk.toString();
    let idx = this.buf.indexOf('\n');
    while (idx !== -1) {
      const line = this.buf.slice(0, idx);
      this.buf = this.buf.slice(idx + 1);
      this.emit?.(line);
      idx = this.buf.indexOf('\n');
    }
  }

  flush() {
    if (this.buf.length > 0) {
      this.emit?.(this.buf);
      this.buf = '';
    }
  }
}

export class DockerDriver implements CodeInterpreterDriver {
  private readonly docker: Dockerode;

  constructor(private readonly options: DockerDriverOptions) {
    this.docker = new Dockerode();
  }

  async execute(
    code: string,
    files?: InputFile[],
    context?: ExecutionContext,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    const timeoutMs =
      this.options.timeoutMs ?? DEFAULT_CODE_INTERPRETER_TIMEOUT_MS;

    // 1. Stage the per-request work dir on a shared host path. The sandbox
    //    bind-mounts this at CONTAINER_WORK_DIR, so host and sandbox see the
    //    same files with no archive-API round trip. Must live on a path
    //    the host Docker daemon can resolve (see DOCKER_SANDBOX_WORK_DIR).
    const hostDir = await mkdtemp(join(this.options.workDirRoot, 'run-'));
    const hostOutputDir = join(hostDir, OUTPUT_SUBDIR);

    let container: Dockerode.Container | undefined;
    let stdout = '';
    let stderr = '';
    const stdoutLines = new LineEmitter((line) => {
      stdout += line + '\n';
      callbacks?.onStdout?.(line);
    });
    const stderrLines = new LineEmitter((line) => {
      stderr += line + '\n';
      callbacks?.onStderr?.(line);
    });

    try {
      await mkdir(hostOutputDir);
      for (const file of files ?? []) {
        assertSafeInputFilename(file.filename);
        await writeFile(join(hostDir, file.filename), file.content);
      }
      // World-writable + sticky so container-root can write and host-uid can
      // later rm -rf. The sticky bit (0o1000) prevents one container from
      // unlinking another's files in the rare case two runs share a root.
      // Upstream note: a follow-up should use User-namespace remap instead.
      await chmod(hostDir, 0o1777);
      await chmod(hostOutputDir, 0o1777);

      // 2. Create a placeholder-Cmd container so exec() can run the user
      //    code while the container stays alive. AutoRemove is off because
      //    we explicitly remove() after harvest so cleanup failures surface.
      container = await this.docker.createContainer({
        Image: this.options.image,
        WorkingDir: CONTAINER_WORK_DIR,
        Cmd: ['sleep', String(Math.ceil(timeoutMs / 1000) + 5)],
        Tty: false,
        HostConfig: {
          AutoRemove: false,
          Binds: [`${hostDir}:${CONTAINER_WORK_DIR}`],
          NetworkMode: this.options.network,
          ReadonlyRootfs: true,
          Memory: (this.options.memoryMb ?? 512) * 1024 * 1024,
          PidsLimit: this.options.pidsLimit ?? 256,
          CapDrop: ['ALL'],
          SecurityOpt: ['no-new-privileges'],
          Runtime: this.options.runtime,
        },
      });
      await container.start();

      // 3. Inject env (TWENTY_SERVER_URL, TWENTY_API_TOKEN, plus anything the
      //    caller passes) and exec the user's Python snippet.
      const env = Object.entries(context?.env ?? {}).map(
        ([k, v]) => `${k}=${v}`,
      );
      const exec = await container.exec({
        Cmd: ['python', '-u', '-c', code],
        Env: env,
        WorkingDir: CONTAINER_WORK_DIR,
        AttachStdout: true,
        AttachStderr: true,
      });
      const stream = await exec.start({ hijack: true, stdin: false });

      const outStream = new PassThrough();
      const errStream = new PassThrough();
      outStream.on('data', (c: Buffer) => stdoutLines.push(c));
      errStream.on('data', (c: Buffer) => stderrLines.push(c));
      container.modem.demuxStream(stream, outStream, errStream);

      // 4. Race the exec against the timeout. On timeout, kill the container
      //    so the exec stream ends and we can report cleanly.
      const execDone = new Promise<void>((resolve, reject) => {
        stream.on('end', resolve);
        stream.on('error', reject);
      });
      let timedOut = false;
      const timeoutHandle = setTimeout(() => {
        timedOut = true;
        container?.kill().catch(() => {
          // ignore; container may already be stopped
        });
      }, timeoutMs);
      try {
        await execDone;
      } catch (err) {
        // The kill triggered by the timeout typically rejects execDone via a
        // stream error. That path must still surface the timeout result, not
        // the generic exitCode-1 envelope from the outer catch — so swallow
        // the error when timedOut is set, and re-throw otherwise.
        if (!timedOut) {
          throw err;
        }
      } finally {
        clearTimeout(timeoutHandle);
      }

      stdoutLines.flush();
      stderrLines.flush();

      // exec.inspect() can also reject if the container was killed mid-call.
      // Treat absent/failed inspect as 137 (SIGKILL'd) and let timedOut win.
      let exitCode: number;
      try {
        const inspect = await exec.inspect();
        exitCode = inspect.ExitCode ?? 137;
      } catch {
        exitCode = 137;
      }

      // 5. Harvest outputs from the host side of the bind mount.
      const outputFiles = await this.harvestOutputs(hostOutputDir, callbacks);

      return {
        stdout: stdout.replace(/\n$/, ''),
        stderr: stderr.replace(/\n$/, ''),
        exitCode: timedOut ? 124 : exitCode,
        files: outputFiles,
        error: timedOut ? 'Execution timed out' : undefined,
      };
    } catch (err) {
      return {
        stdout,
        stderr,
        exitCode: 1,
        files: [],
        error: err instanceof Error ? err.message : String(err),
      };
    } finally {
      if (container) {
        try {
          await container.remove({ force: true });
        } catch {
          // ignore
        }
      }
      try {
        await rm(hostDir, { recursive: true, force: true });
      } catch {
        // ignore
      }
    }
  }

  private async harvestOutputs(
    hostOutputDir: string,
    callbacks?: StreamCallbacks,
  ): Promise<OutputFile[]> {
    let entries: { name: string; isFile: () => boolean }[];
    try {
      entries = await readdir(hostOutputDir, { withFileTypes: true });
    } catch {
      return [];
    }

    const outputs: OutputFile[] = [];
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const content = await readFile(join(hostOutputDir, entry.name));
      const file: OutputFile = {
        filename: entry.name,
        content,
        mimeType: getMimeType(entry.name),
      };
      outputs.push(file);
      callbacks?.onResult?.(file);
    }
    return outputs;
  }
}
