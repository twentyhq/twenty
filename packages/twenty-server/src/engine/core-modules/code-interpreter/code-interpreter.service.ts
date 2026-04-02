import { Injectable } from '@nestjs/common';

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
    const driver = this.codeInterpreterDriverFactory.getCurrentDriver();

    return driver.execute(code, files, context, callbacks);
  }
}
