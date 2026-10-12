import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { type CliErrorCode } from '@/output/types/cli-error-code.type';
import { type ExitCode } from '@/output/types/exit-code.type';

type CliErrorOptions = {
  code: CliErrorCode;
  message: string;
  exitCode?: ExitCode;
  hint?: string;
  details?: Record<string, unknown>;
  cause?: unknown;
};

export class CliError extends Error {
  readonly code: CliErrorCode;
  readonly exitCode: ExitCode;
  readonly hint?: string;
  readonly details?: Record<string, unknown>;

  constructor({
    code,
    message,
    exitCode = EXIT_CODE.FAILURE,
    hint,
    details,
    cause,
  }: CliErrorOptions) {
    super(message, { cause });
    this.name = 'CliError';
    this.code = code;
    this.exitCode = exitCode;
    this.hint = hint;
    this.details = details;
  }
}
