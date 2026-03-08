import { Transform } from 'class-transformer';

export const CastToLogLevelArray = () =>
  Transform(({ value }: { value: string }) => toLogLevelArray(value));

const VALID_LOG_LEVELS = ['log', 'error', 'warn', 'debug', 'verbose'];

const LOG_LEVEL_ALIASES: Record<string, string> = {
  info: 'log',
};

// oxlint-disable-next-line @typescripttypescript/no-explicit-any
const toLogLevelArray = (value: any) => {
  if (typeof value === 'string') {
    const resolvedLogLevels = value
      .split(',')
      .map((level) => level.trim())
      .map((level) => LOG_LEVEL_ALIASES[level] ?? level)
      .filter((level) => VALID_LOG_LEVELS.includes(level));

    if (resolvedLogLevels.length > 0) {
      return resolvedLogLevels;
    }
  }

  return ['log', 'error', 'warn'];
};
