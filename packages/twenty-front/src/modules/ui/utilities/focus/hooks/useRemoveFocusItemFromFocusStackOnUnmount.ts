import { useEffect } from 'react';

import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';

export const useRemoveFocusItemFromFocusStackOnUnmount = ({
  focusId,
  isEnabled,
}: {
  focusId: string;
  isEnabled: boolean;
}) => {
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    return () => {
      removeFocusItemFromFocusStackById({ focusId });
    };
  }, [focusId, isEnabled, removeFocusItemFromFocusStackById]);
};
