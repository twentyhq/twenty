import { Transform } from 'class-transformer';
import { isNonEmptyString } from '@sniptt/guards';

export const CastToTypeORMLogLevelArray = () =>
  Transform(({ value }: { value: string }) => toTypeORMLogLevelArray(value));

// oxlint-disable-next-line @typescripttypescript/no-explicit-any
const toTypeORMLogLevelArray = (value: any) => {
  if (isNonEmptyString(value)) {
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
