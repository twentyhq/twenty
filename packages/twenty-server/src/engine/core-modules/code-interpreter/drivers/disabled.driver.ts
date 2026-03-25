import {
  type CodeExecutionResult,
  type CodeInterpreterDriver,
  type ExecutionContext,
  type InputFile,
  type StreamCallbacks,
} from './interfaces/code-interpreter-driver.interface';

export class DisabledDriver implements CodeInterpreterDriver {
  constructor(private reason: string) {}

  async execute(
    _code: string,
    _files?: InputFile[],
    _context?: ExecutionContext,
    _callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    throw new Error(this.reason);
  }
}
