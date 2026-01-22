import chalk, { type ChalkInstance } from 'chalk';

export type LoggerContext =
  | 'init'
  | 'manifest-watch'
  | 'functions-watch'
  | 'front-components-watch';

type LoggerConfig = {
  prefix: string;
  color: ChalkInstance;
};

const LOGGER_CONFIGS: Record<LoggerContext, LoggerConfig> = {
  init: {
    prefix: '[init]',
    color: chalk.cyan,
  },
  'manifest-watch': {
    prefix: '[manifest-watch]',
    color: chalk.magenta,
  },
  'functions-watch': {
    prefix: '[functions-watch]',
    color: chalk.yellow,
  },
  'front-components-watch': {
    prefix: '[front-components-watch]',
    color: chalk.green,
  },
};

export type Logger = {
  log: (message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warn: (message: string) => void;
  gray: (message: string) => void;
  watching: () => void;
};

export const createLogger = (context: LoggerContext): Logger => {
  const config = LOGGER_CONFIGS[context];
  const prefix = config.color(config.prefix);

  return {
    log: (message: string) => console.log(`${prefix} ${message}`),
    success: (message: string) => console.log(`${prefix} ${chalk.green(message)}`),
    error: (message: string) => console.error(`${prefix} ${chalk.red(message)}`),
    warn: (message: string) => console.log(`${prefix} ${chalk.yellow(message)}`),
    gray: (message: string) => console.log(`${prefix} ${chalk.gray(message)}`),
    watching: () => console.log(`${prefix} ${chalk.gray('👀 Watching for changes...')}`),
  };
};
