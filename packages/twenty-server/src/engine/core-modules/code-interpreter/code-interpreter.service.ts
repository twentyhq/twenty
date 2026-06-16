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
  // One active stream per thread (the chat resolver queues the rest), so
  // in-process chaining is enough to serialize a session — no distributed lock.
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
