import { Transform } from 'class-transformer';

const VALID_LOG_LEVELS = [
  'log',
  'error',
  'warn',
  'debug',
  'verbose',
  'performance',
];

export const CastToLogLevelArray = () =>
  Transform(({ value }: { value: string }) => toLogLevelArray(value));

const toLogLevelArray = (value: unknown) => {
  if (typeof value === 'string') {
    const rawLogLevels = value.split(',').map((level) => level.trim());
    const invalidLevels = rawLogLevels.filter(
      (level) => !VALID_LOG_LEVELS.includes(level),
    );

    if (invalidLevels.length > 0) {
      throw new Error(
        `Invalid log level(s): ${invalidLevels.join(', ')}. Valid levels are: ${VALID_LOG_LEVELS.join(', ')}`,
      );
    }

    return rawLogLevels;
  }

  return undefined;
};
