import { isNonEmptyString } from '@sniptt/guards';

import { type OutputMode } from '@/output/types/output-mode.type';

const FALSE_VALUES = new Set(['0', 'false']);

const isContinuousIntegration = () => {
  const continuousIntegration = process.env.CI;

  return (
    isNonEmptyString(continuousIntegration) &&
    !FALSE_VALUES.has(continuousIntegration.toLowerCase())
  );
};

export const isInteractionAllowed = ({
  options,
  outputMode,
}: {
  options: Record<string, unknown>;
  outputMode: OutputMode;
}) =>
  options.input !== false &&
  outputMode === 'human' &&
  process.stdin.isTTY === true &&
  !isContinuousIntegration();
