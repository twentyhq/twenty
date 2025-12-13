import { Inject, Injectable } from '@nestjs/common';

import { CODE_INTERPRETER_DRIVER } from './code-interpreter.constants';
import {
  type CodeExecutionResult,
  type CodeInterpreterDriver,
  type InputFile,
} from './drivers/interfaces/code-interpreter-driver.interface';

@Injectable()
export class CodeInterpreterService implements CodeInterpreterDriver {
  constructor(
    @Inject(CODE_INTERPRETER_DRIVER) private driver: CodeInterpreterDriver,
  ) {}

  execute(code: string, files?: InputFile[]): Promise<CodeExecutionResult> {
    return this.driver.execute(code, files);
  }
}

