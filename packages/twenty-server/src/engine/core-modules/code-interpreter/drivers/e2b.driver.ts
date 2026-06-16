import { promises as fs } from 'fs';
import { join } from 'path';

import { Sandbox } from '@e2b/code-interpreter';
import { Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { DEFAULT_CODE_INTERPRETER_TIMEOUT_MS } from 'src/engine/core-modules/code-interpreter/code-interpreter.constants';
import { getOrCreateSessionSandbox } from 'src/engine/core-modules/code-interpreter/drivers/utils/get-or-create-session-sandbox.util';
import { getMimeType } from 'src/engine/core-modules/code-interpreter/utils/get-mime-type.util';

import {
  type CodeExecutionResult,
  type CodeInterpreterDriver,
  type ExecutionContext,
  type InputFile,
  type OutputFile,
  type StreamCallbacks,
} from './interfaces/code-interpreter-driver.interface';

export type E2BDriverOptions = {
  apiKey: string;
  timeoutMs?: number;
  idleTimeoutMs?: number;
};

const SANDBOX_SCRIPTS_PATH = join(__dirname, '..', 'sandbox-scripts');

async function uploadDirectoryToSandbox(
  sandbox: Sandbox,
  localPath: string,
  remotePath: string,
) {
  const entries = await fs.readdir(localPath, { withFileTypes: true });

  for (const entry of entries) {
    const localEntryPath = join(localPath, entry.name);
    const remoteEntryPath = `${remotePath}/${entry.name}`;

    if (entry.isDirectory()) {
      await uploadDirectoryToSandbox(sandbox, localEntryPath, remoteEntryPath);
    } else {
      const content = await fs.readFile(localEntryPath);
      const arrayBuffer = new Uint8Array(content).buffer;

      await sandbox.files.write(remoteEntryPath, arrayBuffer);
    }
  }
}

export class E2BDriver implements CodeInterpreterDriver {
  private readonly logger = new Logger(E2BDriver.name);

  constructor(private options: E2BDriverOptions) {}

  async execute(
    code: string,
    files?: InputFile[],
    context?: ExecutionContext,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    const { apiKey } = this.options;
    const sessionId = context?.sessionId;
    const idleTimeoutMs =
      this.options.idleTimeoutMs ?? DEFAULT_CODE_INTERPRETER_TIMEOUT_MS;
    const timeoutMs =
      this.options.timeoutMs ?? DEFAULT_CODE_INTERPRETER_TIMEOUT_MS;

    let sandbox: Sandbox;
    let isReused = false;
    let keepWarm = false;

    if (isDefined(sessionId)) {
      keepWarm = true;
      ({ sandbox, isReused } = await getOrCreateSessionSandbox({
        sandboxApi: Sandbox,
        apiKey,
        sessionId,
        idleTimeoutMs,
      }));
    } else {
      sandbox = await Sandbox.create({ apiKey, timeoutMs });
    }

    try {
      // Pre-installed scripts only need uploading to a fresh sandbox; a reused
      // one already has them, along with its prior files and kernel state.
      if (!isReused) {
        try {
          await uploadDirectoryToSandbox(
            sandbox,
            SANDBOX_SCRIPTS_PATH,
            '/home/user/scripts',
          );
        } catch {
          // Scripts directory might not exist
        }
      }

      // A reused sandbox still holds the previous call's output files; reset the
      // output directory so this run only returns the artifacts it produces.
      // Durable state (working files, kernel variables) is kept across calls.
      if (isReused) {
        await this.resetOutputDirectory(sandbox);
      }

      for (const file of files ?? []) {
        const arrayBuffer = new Uint8Array(file.content).buffer;

        await sandbox.files.write(`/home/user/${file.filename}`, arrayBuffer);
      }

      const envSetup = context?.env
        ? `import os\n${Object.entries(context.env)
            .map(([key, value]) => {
              const escapedValue = value
                .replace(/\\/g, '\\\\')
                .replace(/'/g, "\\'")
                .replace(/\n/g, '\\n')
                .replace(/\r/g, '\\r');

              return `os.environ['${key}'] = '${escapedValue}'`;
            })
            .join('\n')}\n\n`
        : '';

      const outputFiles: OutputFile[] = [];
      let chartCounter = 0;

      const execution = await sandbox.runCode(envSetup + code, {
        onStdout: (data) => callbacks?.onStdout?.(data.line),
        onStderr: (data) => callbacks?.onStderr?.(data.line),
        onResult: async (result) => {
          if (result.png) {
            const outputFile: OutputFile = {
              filename: `chart-${chartCounter++}.png`,
              content: Buffer.from(result.png, 'base64'),
              mimeType: 'image/png',
            };

            outputFiles.push(outputFile);
            await callbacks?.onResult?.(outputFile);
          }
        },
      });

      try {
        const outputDir = await sandbox.files.list('/home/user/output');

        for (const file of outputDir) {
          if (file.type === 'file') {
            const content = await sandbox.files.read(
              `/home/user/output/${file.name}`,
            );

            const outputFile: OutputFile = {
              filename: file.name,
              content: Buffer.from(content),
              mimeType: getMimeType(file.name),
            };

            outputFiles.push(outputFile);
            await callbacks?.onResult?.(outputFile);
          }
        }
      } catch {
        // Output directory doesn't exist - that's fine
      }

      return {
        stdout: execution.logs.stdout.join('\n'),
        stderr: execution.logs.stderr.join('\n'),
        exitCode: execution.error ? 1 : 0,
        files: outputFiles,
        error: execution.error?.value,
      };
    } finally {
      // A warm session sandbox is left running for the next call and reclaimed
      // by E2B after the idle timeout; one-shot sandboxes are torn down now.
      if (!keepWarm) {
        await sandbox.kill();
      }
    }
  }

  // Clear a reused sandbox's output directory before a run. A missing directory
  // is the expected case (it hasn't produced output yet); any other failure
  // means stale files could survive into this run's results, so it is logged
  // instead of being silently swallowed.
  private async resetOutputDirectory(sandbox: Sandbox): Promise<void> {
    const outputDirectory = '/home/user/output';

    try {
      if (await sandbox.files.exists(outputDirectory)) {
        await sandbox.files.remove(outputDirectory);
      }

      await sandbox.files.makeDir(outputDirectory);
    } catch (error) {
      const reason = error instanceof Error ? error.message : String(error);

      this.logger.warn(
        `Failed to reset reused sandbox output directory; results may include stale files: ${reason}`,
      );
    }
  }
}
