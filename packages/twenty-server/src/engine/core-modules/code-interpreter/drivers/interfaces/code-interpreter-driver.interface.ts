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

export type ExecutionContext = {
  env?: Record<string, string>;
  sessionId?: string;
};

export type StreamCallbacks = {
  onStdout?: (line: string) => void;
  onStderr?: (line: string) => void;
  onResult?: (result: OutputFile) => Promise<void>;
};

export interface CodeInterpreterDriver {
  execute(
    code: string,
    files?: InputFile[],
    context?: ExecutionContext,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult>;
  // Only stateful drivers (E2B) keep reusable sandboxes that need reclaiming.
  releaseSession?(sessionId: string): Promise<void>;
  sweepExpiredSessions?(maxAgeMs: number): Promise<number>;
}
