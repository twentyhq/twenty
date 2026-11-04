import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const readLocalInteger = ({
  value,
  name,
  maximum,
}: {
  value: string | undefined;
  name: string;
  maximum: number;
}) => {
  if (!isDefined(value)) {
    return undefined;
  }
  if (!/^\d+$/.test(value) || Number(value) < 1 || Number(value) > maximum) {
    throw new CliError({
      code: 'INVALID_INPUT',
      exitCode: EXIT_CODE.USAGE,
      message: `${name} must be an integer between 1 and ${maximum}.`,
    });
  }
  return Number(value);
};
