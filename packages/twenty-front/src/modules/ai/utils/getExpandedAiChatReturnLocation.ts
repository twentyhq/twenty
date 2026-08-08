import { isValidReturnToPath } from '@/auth/utils/isValidReturnToPath';

// The chat page's history entry carries where expansion started. Anyone can
// craft a link with arbitrary history state, so the return location is
// validated as an in-app path before it is navigated to.
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
