import { promises as fs } from 'fs';
import { join } from 'path';

import { Sandbox } from '@e2b/code-interpreter';

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

export type E2BDriverOptions = {
  apiKey: string;
  timeoutMs?: number;
};

const SANDBOX_SCRIPTS_PATH = join(__dirname, '..', 'sandbox-scripts');

async function uploadDirectoryToSandbox(
  sbx: Sandbox,
  localPath: string,
  remotePath: string,
) {
  const entries = await fs.readdir(localPath, { withFileTypes: true });

  for (const entry of entries) {
    const localEntryPath = join(localPath, entry.name);
    const remoteEntryPath = `${remotePath}/${entry.name}`;

    if (entry.isDirectory()) {
      await uploadDirectoryToSandbox(sbx, localEntryPath, remoteEntryPath);
    } else {
      const content = await fs.readFile(localEntryPath);
      const arrayBuffer = new Uint8Array(content).buffer;

      await sbx.files.write(remoteEntryPath, arrayBuffer);
    }
  }
}

export class E2BDriver implements CodeInterpreterDriver {
  constructor(private options: E2BDriverOptions) {}

  async execute(
    code: string,
    files?: InputFile[],
    context?: ExecutionContext,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    const sbx = await Sandbox.create({
      apiKey: this.options.apiKey,
      timeoutMs: this.options.timeoutMs ?? DEFAULT_CODE_INTERPRETER_TIMEOUT_MS,
    });

    try {
      // Upload pre-installed scripts to sandbox
      try {
        await uploadDirectoryToSandbox(
          sbx,
          SANDBOX_SCRIPTS_PATH,
          '/home/user/scripts',
        );
      } catch {
        // Scripts directory might not exist
      }

      for (const file of files ?? []) {
        const arrayBuffer = new Uint8Array(file.content).buffer;

        await sbx.files.write(`/home/user/${file.filename}`, arrayBuffer);
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

      const execution = await sbx.runCode(envSetup + code, {
        onStdout: (data) => callbacks?.onStdout?.(data.line),
        onStderr: (data) => callbacks?.onStderr?.(data.line),
        onResult: (result) => {
          if (result.png) {
            const outputFile: OutputFile = {
              filename: `chart-${chartCounter++}.png`,
              content: Buffer.from(result.png, 'base64'),
              mimeType: 'image/png',
            };

            outputFiles.push(outputFile);
            callbacks?.onResult?.(outputFile);
          }
        },
      });

      try {
        const outputDir = await sbx.files.list('/home/user/output');

        for (const file of outputDir) {
          if (file.type === 'file') {
            const content = await sbx.files.read(
              `/home/user/output/${file.name}`,
            );

            const outputFile: OutputFile = {
              filename: file.name,
              content: Buffer.from(content),
              mimeType: getMimeType(file.name),
            };

            outputFiles.push(outputFile);
            callbacks?.onResult?.(outputFile);
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
      await sbx.kill();
    }
  }
}
