import { useEffect } from 'react';

import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';

type DropdownFocusCleanupEffectProps = {
  focusId: string;
};

export const DropdownFocusCleanupEffect = ({
  focusId,
}: DropdownFocusCleanupEffectProps) => {
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(
    () => () => removeFocusItemFromFocusStackById({ focusId }),
    [focusId, removeFocusItemFromFocusStackById],
  );

  return null;
};
