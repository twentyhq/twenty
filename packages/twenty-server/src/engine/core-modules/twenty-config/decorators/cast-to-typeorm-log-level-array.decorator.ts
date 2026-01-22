import { Transform } from 'class-transformer';

export const CastToTypeORMLogLevelArray = () =>
  Transform(({ value }: { value: string }) => toTypeORMLogLevelArray(value));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toTypeORMLogLevelArray = (value: any) => {
  if (typeof value === 'string') {
    const rawLogLevels = value.split(',').map((level) => level.trim());
    const validLevels = [
      'query',
      'schema',
      'error',
      'warn',
      'info',
      'log',
      'migration',
    ];
    const isInvalid = rawLogLevels.some(
      (level) => !validLevels.includes(level),
    );

    if (!isInvalid) {
      return rawLogLevels;
    }
  }

  return undefined;
};
