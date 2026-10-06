import { isPlainObject } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

const createInvalidJsonError = (optionName: string, reason: string) =>
  new CliError({
    code: 'INVALID_INPUT',
    exitCode: EXIT_CODE.USAGE,
    message: `${optionName} is not valid JSON: ${reason}`,
  });

export const parseJsonInput = ({
  text,
  optionName,
}: {
  text: string;
  optionName: string;
}): unknown => {
  try {
    return JSON.parse(text);
  } catch (error) {
    throw createInvalidJsonError(
      optionName,
      error instanceof Error ? error.message : String(error),
    );
  }
};

export const parseJsonObjectInput = ({
  text,
  optionName,
}: {
  text: string;
  optionName: string;
}) => {
  const value = parseJsonInput({ text, optionName });

  if (!isPlainObject(value)) {
    throw createInvalidJsonError(optionName, 'expected a JSON object.');
  }

  return value;
};
