import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

const REMOTE_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._-]{0,62}$/;

export const validateRemoteName = (remoteName: string) => {
  if (!REMOTE_NAME_PATTERN.test(remoteName)) {
    throw new CliError({
      code: 'INVALID_REMOTE_NAME',
      exitCode: EXIT_CODE.USAGE,
      message: `${remoteName} is not a valid remote name.`,
      hint: 'Use letters, digits, dots, dashes and underscores, starting with a letter or digit.',
    });
  }

  return remoteName;
};
