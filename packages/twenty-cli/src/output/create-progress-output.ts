import { clearLine, cursorTo } from 'node:readline';
import stringWidth from 'string-width';

import { isDefined } from 'twenty-shared/utils';

import { formatProgressLine } from '@/output/format-progress-line';
import { type OutputMode } from '@/output/types/output-mode.type';
import { type Output } from '@/output/types/output.type';
import { writeLine } from '@/output/write-line';
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

  const write: Output['progress'] = ({ message, percentage }) => {
    const progressText = isDefined(percentage) ? `${percentage}%` : '';
    const barWidth = Math.min(
      20,
      (process.stderr.columns ?? 80) -
        stringWidth(message) -
        progressText.length -
        5,
    );

    clear();

    if (
      mode !== 'human' ||
      !process.stderr.isTTY ||
      isContinuousIntegration() ||
      process.env.TERM === 'dumb' ||
      !isDefined(percentage) ||
      !Number.isFinite(percentage) ||
      barWidth < 4
    ) {
      writeLine({
        stream: process.stderr,
        text: formatProgressLine({ message, percentage }),
      });

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
