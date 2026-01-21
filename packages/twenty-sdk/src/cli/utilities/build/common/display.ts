import chalk from 'chalk';

export const printWatchingMessage = (): void => {
  console.log('');
  console.log(chalk.gray('👀 Watching for changes... (Press Ctrl+C to stop)'));
};
