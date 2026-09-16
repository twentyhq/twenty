import { useEffect } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

type NavigationMenuItemNameInputFocusEffectProps = {
  focusId: string;
};

export const NavigationMenuItemNameInputFocusEffect = ({
  focusId,
}: NavigationMenuItemNameInputFocusEffectProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  useEffect(() => {
    pushFocusItemToFocusStack({
      focusId,
      component: { type: FocusComponentType.TEXT_INPUT, instanceId: focusId },
      globalHotkeysConfig: {
        enableGlobalHotkeysConflictingWithKeyboard: false,
      },
    });

    return () => removeFocusItemFromFocusStackById({ focusId });
  }, [focusId, pushFocusItemToFocusStack, removeFocusItemFromFocusStackById]);

  return <></>;
};
