import { clearLine, cursorTo } from 'node:readline';
import { stripVTControlCharacters } from 'node:util';

import { isDefined } from 'twenty-shared/utils';

import { type OutputMode } from '@/output/types/output-mode.type';
import { type Output } from '@/output/types/output.type';
import { isContinuousIntegration } from '@/utils/is-continuous-integration';

export const createProgressOutput = ({ mode }: { mode: OutputMode }) => {
  let hasActiveBar = false;

  const clear = () => {
    if (!hasActiveBar) {
      return;
    }

    cursorTo(process.stderr, 0);
    clearLine(process.stderr, 0);
    hasActiveBar = false;
  };

  const write: Output['progress'] = (message, options) => {
    const percentage = options?.percentage;
    const progressText = isDefined(percentage) ? `${percentage}%` : '';
    const barWidth = Math.min(
      20,
      (process.stderr.columns ?? 80) -
        stripVTControlCharacters(message).length -
        progressText.length -
        5,
    );

    clear();

    if (
      mode !== 'human' ||
      process.stderr.isTTY !== true ||
      isContinuousIntegration() ||
      process.env.TERM === 'dumb' ||
      !isDefined(percentage) ||
      !Number.isFinite(percentage) ||
      barWidth < 4
    ) {
      const line = isDefined(percentage)
        ? `${message} ${progressText}`
        : message;

      process.stderr.write(line.endsWith('\n') ? line : `${line}\n`);

      return;
    }

    const filledWidth = Math.round(
      (Math.min(100, Math.max(0, percentage)) / 100) * barWidth,
    );
    const bar = '█'.repeat(filledWidth) + '░'.repeat(barWidth - filledWidth);

    process.stderr.write(`${message}  ${bar}  ${progressText}`);
    hasActiveBar = true;
  };

  return { write, clear };
};
