import { styleText } from 'node:util';

export const dimText = (
  text: string,
  stream: NodeJS.WriteStream = process.stdout,
) => styleText('dim', text, { stream });

export const colorText = (
  color: 'cyan' | 'green' | 'magenta' | 'red' | 'yellow',
  text: string,
  stream: NodeJS.WriteStream = process.stdout,
) => styleText(color, text, { stream });

export const commandText = (command: string) => colorText('cyan', command);

export const boldText = (
  text: string,
  stream: NodeJS.WriteStream = process.stdout,
) => styleText('bold', text, { stream });

export const formatSuccessLine = (message: string) =>
  `${styleText('green', '✓', { stream: process.stdout })} ${message}`;

export const formatFailureLine = (message: string) =>
  `${styleText('red', '✗', { stream: process.stderr })} ${message}`;

export const formatWarningLine = (message: string) =>
  `${styleText('yellow', '!', { stream: process.stderr })} ${message}`;
