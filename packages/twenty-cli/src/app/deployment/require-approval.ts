import { confirmInTerminal } from '@/input/confirm-in-terminal';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';
import { type CliErrorCode } from '@/output/types/cli-error-code.type';

export const requireApproval = async ({
  isApproved,
  canPrompt,
  question,
  code,
  message,
  hint,
  declinedMessage,
  signal,
}: {
  isApproved: boolean;
  canPrompt: boolean;
  question: string;
  code: CliErrorCode;
  message: string;
  hint: string;
  declinedMessage: string;
  signal: AbortSignal;
}) => {
  if (isApproved) {
    return;
  }

  if (!canPrompt) {
    throw new CliError({ code, exitCode: EXIT_CODE.USAGE, message, hint });
  }

  if (!(await confirmInTerminal({ question, signal }))) {
    throw new CliError({
      code: 'CONFIRMATION_DECLINED',
      exitCode: EXIT_CODE.USAGE,
      message: declinedMessage,
    });
  }
};
