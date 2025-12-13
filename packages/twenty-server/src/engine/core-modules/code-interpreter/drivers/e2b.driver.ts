import { Sandbox } from '@e2b/code-interpreter';

import {
  type CodeExecutionResult,
  type CodeInterpreterDriver,
  type InputFile,
  type OutputFile,
} from './interfaces/code-interpreter-driver.interface';

export type E2BDriverOptions = {
  apiKey: string;
  timeoutMs?: number;
};

export class E2BDriver implements CodeInterpreterDriver {
  constructor(private options: E2BDriverOptions) {}

  async execute(
    code: string,
    files?: InputFile[],
  ): Promise<CodeExecutionResult> {
    const sbx = await Sandbox.create({
      apiKey: this.options.apiKey,
      timeoutMs: this.options.timeoutMs ?? 300_000,
    });

    try {
      for (const file of files ?? []) {
        const arrayBuffer = new Uint8Array(file.content).buffer;

        await sbx.files.write(`/home/user/${file.filename}`, arrayBuffer);
      }

      const execution = await sbx.runCode(code);

      const outputFiles: OutputFile[] = [];

      for (const result of execution.results) {
        if (result.png) {
          outputFiles.push({
            filename: `chart-${outputFiles.length}.png`,
            content: Buffer.from(result.png, 'base64'),
            mimeType: 'image/png',
          });
        }
      }

      try {
        const outputDir = await sbx.files.list('/home/user/output');

        for (const file of outputDir) {
          if (file.type === 'file') {
            const content = await sbx.files.read(
              `/home/user/output/${file.name}`,
            );

            outputFiles.push({
              filename: file.name,
              content: Buffer.from(content),
              mimeType: this.getMimeType(file.name),
            });
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

