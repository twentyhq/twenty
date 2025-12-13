export type InputFile = {
  filename: string;
  content: Buffer;
  mimeType: string;
};

export type OutputFile = {
  filename: string;
  content: Buffer;
  mimeType: string;
};

export type CodeExecutionResult = {
  stdout: string;
  stderr: string;
  exitCode: number;
  files: OutputFile[];
  error?: string;
};

export interface CodeInterpreterDriver {
  execute(code: string, files?: InputFile[]): Promise<CodeExecutionResult>;
}

