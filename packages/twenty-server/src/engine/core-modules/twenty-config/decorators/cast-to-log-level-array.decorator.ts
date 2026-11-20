import { isNonEmptyArray } from 'twenty-shared/utils';
import { Transform } from 'class-transformer';

import { toTrimmedStringArray } from 'src/engine/core-modules/twenty-config/utils/to-trimmed-string-array.util';

const VALID_LOG_LEVELS = [
  'log',
  'error',
  'warn',
  'debug',
  'verbose',
  'performance',
];

export const CastToLogLevelArray = () =>
  Transform(({ value }: { value: unknown }) => toLogLevelArray(value));

const toLogLevelArray = (value: unknown) => {
  const rawLogLevels = toTrimmedStringArray(value);

  if (!isNonEmptyArray(rawLogLevels)) {
    return undefined;
  }

  const invalidLevels = rawLogLevels.filter(
    (level) => !VALID_LOG_LEVELS.includes(level),
  );

  if (invalidLevels.length > 0) {
    throw new Error(
      `Invalid log level(s): ${invalidLevels.join(', ')}. Valid levels are: ${VALID_LOG_LEVELS.join(', ')}`,
    );
  }

  return rawLogLevels;
};
