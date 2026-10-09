import { isNonEmptyString } from '@sniptt/guards';
import { type ExtendedUIMessage } from 'twenty-shared/ai';

const MINIMUM_WORK_DURATION_MS = 1000;

export const getAgentChatMessageWorkDurationMs = ({
  metadata,
  isStreaming,
}: {
  metadata: ExtendedUIMessage['metadata'];
  isStreaming: boolean;
}): number | null => {
  const startedAt = metadata?.startedAt;
  const finishedAt = metadata?.finishedAt;

  if (!isNonEmptyString(startedAt)) {
    return null;
  }

  if (!isNonEmptyString(finishedAt) && !isStreaming) {
    return null;
  }

  const endedAtMs = isNonEmptyString(finishedAt)
    ? new Date(finishedAt).getTime()
    : Date.now();
  const durationMs = endedAtMs - new Date(startedAt).getTime();

  // messages written in a single save, like agent run replies, carry no real duration
  return durationMs >= MINIMUM_WORK_DURATION_MS ? durationMs : null;
};
