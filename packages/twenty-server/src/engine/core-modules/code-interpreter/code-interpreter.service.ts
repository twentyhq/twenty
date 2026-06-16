import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { CodeInterpreterDriverFactory } from 'src/engine/core-modules/code-interpreter/code-interpreter-driver.factory';
import { CodeInterpreterDriverType } from 'src/engine/core-modules/code-interpreter/code-interpreter.interface';
import {
  type CodeExecutionResult,
  type CodeInterpreterDriver,
  type ExecutionContext,
  type InputFile,
  type StreamCallbacks,
} from 'src/engine/core-modules/code-interpreter/drivers/interfaces/code-interpreter-driver.interface';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class CodeInterpreterService implements CodeInterpreterDriver {
  // Serializes calls that share a reused sandbox so concurrent tool calls can't
  // race the same kernel. In-process is sufficient: a thread has at most one
  // active stream at a time (the chat resolver queues new messages while the
  // thread's activeStreamId is set), and that stream runs as a single job in one
  // worker process — so the only concurrency to guard is parallel tool calls
  // within a single turn, which share this process. The session key is
  // workspaceId:threadId, so distinct threads never contend for the same entry.
  private readonly sessionExecutionTails = new Map<string, Promise<void>>();

  constructor(
    private readonly codeInterpreterDriverFactory: CodeInterpreterDriverFactory,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  isEnabled(): boolean {
    return (
      this.twentyConfigService.get('CODE_INTERPRETER_TYPE') !==
      CodeInterpreterDriverType.DISABLED
    );
  }

  execute(
    code: string,
    files?: InputFile[],
    context?: ExecutionContext,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    const sessionId = context?.sessionId;

    // A reused sandbox is shared across a conversation's calls; serialize them
    // so concurrent tool calls can't race the same kernel.
    if (isDefined(sessionId)) {
      return this.runSerializedPerSession(sessionId, () =>
        this.runOnDriver(code, files, context, callbacks),
      );
    }

    return this.runOnDriver(code, files, context, callbacks);
  }

  private runOnDriver(
    code: string,
    files?: InputFile[],
    context?: ExecutionContext,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    return this.codeInterpreterDriverFactory
      .getCurrentDriver()
      .execute(code, files, context, callbacks);
  }

  // Chains each new task on the session's previous one so executions sharing a
  // session run strictly one after another.
  private async runSerializedPerSession<T>(
    sessionId: string,
    task: () => Promise<T>,
  ): Promise<T> {
    const previous =
      this.sessionExecutionTails.get(sessionId) ?? Promise.resolve();
    const result = previous.then(task, task);
    const tail = result.then(
      () => undefined,
      () => undefined,
    );

    this.sessionExecutionTails.set(sessionId, tail);

    try {
      return await result;
    } finally {
      if (this.sessionExecutionTails.get(sessionId) === tail) {
        this.sessionExecutionTails.delete(sessionId);
      }
    }
  }
}
