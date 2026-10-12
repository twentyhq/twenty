import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const createCancelledError = () =>
  new CliError({
    code: 'CANCELLED',
    message: 'Cancelled.',
    exitCode: EXIT_CODE.CANCELLED,
  });
