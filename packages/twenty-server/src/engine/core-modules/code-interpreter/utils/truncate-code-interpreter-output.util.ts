import { CODE_INTERPRETER_MAX_OUTPUT_LENGTH } from 'src/engine/core-modules/code-interpreter/code-interpreter.constants';

const TRUNCATION_MARKER = '\n[output truncated]';

export const truncateCodeInterpreterOutput = (output: string): string =>
  output.length > CODE_INTERPRETER_MAX_OUTPUT_LENGTH
    ? output.slice(0, CODE_INTERPRETER_MAX_OUTPUT_LENGTH) + TRUNCATION_MARKER
    : output;
