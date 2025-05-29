import { Transform } from 'class-transformer';

export const CastToLogLevelArray = () =>
  Transform(({ value }: { value: string }) => toLogLevelArray(value));

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toLogLevelArray = (value: any) => {
  if (typeof value === 'string') {
    const rawLogLevels = value.split(',').map((level) => level.trim());
    const isInvalid = rawLogLevels.some(
      (level) => !['log', 'error', 'warn', 'debug', 'verbose'].includes(level),
    );

    if (!isInvalid) {
      return rawLogLevels;
    }
  }

  return undefined;
};
