import chalk, { type ChalkInstance } from 'chalk';

export type LoggerContext = 'init' | 'manifest-builder' | 'dev-mode';

type LoggerConfig = {
  prefix: string;
  color: ChalkInstance;
};

const LOGGER_CONFIGS: Record<LoggerContext, LoggerConfig> = {
  init: {
    prefix: '[init]',
    color: chalk.cyan,
  },
  'manifest-builder': {
    prefix: '[manifest-builder]',
    color: chalk.blue,
  },
  'dev-mode': {
    prefix: '[dev-mode]',
    color: chalk.blueBright,
  },
};

export type Logger = {
  log: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
};

export const createLogger = (context: LoggerContext): Logger => {
  const config = LOGGER_CONFIGS[context];
  const prefix = config.color(config.prefix);

  return {
    log: (message: string) => console.log(`${prefix} ${message}`),
    success: (message: string) =>
      console.log(`${prefix} ${chalk.green(message)}`),
    error: (message: string) =>
      console.error(`${prefix} ${chalk.red(message)}`),
    warn: (message: string) =>
      console.log(`${prefix} ${chalk.yellow(message)}`),
  };
};
