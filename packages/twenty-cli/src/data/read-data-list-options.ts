import { isDefined } from 'twenty-shared/utils';

import {
  readBooleanOption,
  readStringOption,
} from '@/catalog/read-command-values';
import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

export const readDataListOptions = (options: Record<string, unknown>) => {
  const limitText = readStringOption(options, 'limit') ?? '50';
  const limit = Number(limitText);
  const fieldsText = readStringOption(options, 'fields');
  const fields = fieldsText?.split(',').map((field) => field.trim());
  const cursor = readStringOption(options, 'cursor');

  if (
    !/^\d+$/.test(limitText) ||
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > 200
  ) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: '--limit must be an integer between 1 and 200.',
    });
  }

  if (
    fields?.some((field) => field.length === 0) ||
    (isDefined(cursor) && cursor.length === 0)
  ) {
    throw new CliError({
      code: 'USAGE',
      exitCode: EXIT_CODE.USAGE,
      message: '--fields and --cursor cannot contain empty values.',
    });
  }

  return {
    limit,
    fields: isDefined(fields) ? [...new Set(fields)] : undefined,
    cursor,
    filter: readStringOption(options, 'filter'),
    orderBy: readStringOption(options, 'orderBy'),
    all: readBooleanOption(options, 'all'),
  };
};
