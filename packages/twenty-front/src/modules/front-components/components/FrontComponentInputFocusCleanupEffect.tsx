import { useEffect } from 'react';

import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';

type FrontComponentInputFocusCleanupEffectProps = {
  focusId: string;
};

export const FrontComponentInputFocusCleanupEffect = ({
  focusId,
}: FrontComponentInputFocusCleanupEffectProps) => {
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(
    () => () => removeFocusItemFromFocusStackById({ focusId }),
    [focusId, removeFocusItemFromFocusStackById],
  );

  return null;
};
