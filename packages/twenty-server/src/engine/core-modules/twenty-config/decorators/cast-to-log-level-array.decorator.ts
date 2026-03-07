import { Transform } from 'class-transformer';

const LOG_LEVEL_ALIASES: Record<string, string> = {
  info: 'log',
};

const VALID_LOG_LEVELS = ['log', 'error', 'warn', 'debug', 'verbose'];

export const CastToLogLevelArray = () =>
  Transform(({ value }: { value: string }) => toLogLevelArray(value));

// oxlint-disable-next-line @typescripttypescript/no-explicit-any
const toLogLevelArray = (value: any) => {
  if (typeof value === 'string') {
    const normalizedLevels = value
      .split(',')
      .map((level) => level.trim())
      .map((level) => LOG_LEVEL_ALIASES[level] ?? level);

    const validLevels = normalizedLevels.filter((level) =>
      VALID_LOG_LEVELS.includes(level),
    );

    if (validLevels.length > 0) {
      return [...new Set(validLevels)];
    }
  }

  return undefined;
};
