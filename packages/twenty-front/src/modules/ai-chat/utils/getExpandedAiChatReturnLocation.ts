import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';

export const getExpandedAiChatReturnLocation = (historyState: unknown) => {
  if (
    typeof historyState !== 'object' ||
    historyState === null ||
    !('returnLocation' in historyState)
  ) {
    return null;
  }

  const { returnLocation } = historyState;

  return typeof returnLocation === 'string' &&
    isValidReturnToPath(returnLocation)
    ? returnLocation
    : null;
};
