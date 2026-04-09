import { Injectable } from '@nestjs/common';

import { CodeInterpreterDriverFactory } from 'src/engine/core-modules/code-interpreter/code-interpreter-driver.factory';
import {
  type CodeExecutionResult,
  type CodeInterpreterDriver,
  type ExecutionContext,
  type InputFile,
  type StreamCallbacks,
} from 'src/engine/core-modules/code-interpreter/drivers/interfaces/code-interpreter-driver.interface';

@Injectable()
export class CodeInterpreterService implements CodeInterpreterDriver {
  constructor(
    private readonly codeInterpreterDriverFactory: CodeInterpreterDriverFactory,
  ) {}

  execute(
    code: string,
    files?: InputFile[],
    context?: ExecutionContext,
    callbacks?: StreamCallbacks,
  ): Promise<CodeExecutionResult> {
    const driver = this.codeInterpreterDriverFactory.getCurrentDriver();

    return driver.execute(code, files, context, callbacks);
  }
}
