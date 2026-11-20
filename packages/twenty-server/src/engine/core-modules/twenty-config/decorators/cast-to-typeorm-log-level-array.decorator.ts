import { isNonEmptyArray } from 'twenty-shared/utils';
import { Transform } from 'class-transformer';

import { toTrimmedStringArray } from 'src/engine/core-modules/twenty-config/utils/to-trimmed-string-array.util';

const VALID_TYPEORM_LOG_LEVELS = [
  'query',
  'schema',
  'error',
  'warn',
  'info',
  'log',
  'migration',
];

export const CastToTypeORMLogLevelArray = () =>
  Transform(({ value }: { value: unknown }) => toTypeORMLogLevelArray(value));

const toTypeORMLogLevelArray = (value: unknown) => {
  const rawLogLevels = toTrimmedStringArray(value);

  if (!isNonEmptyArray(rawLogLevels)) {
    return undefined;
  }

  const isInvalid = rawLogLevels.some(
    (level) => !VALID_TYPEORM_LOG_LEVELS.includes(level),
  );

  return isInvalid ? undefined : rawLogLevels;
};
