import { type OutputMode } from '@/output/types/output-mode.type';
import { isContinuousIntegration } from '@/utils/is-continuous-integration';

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
