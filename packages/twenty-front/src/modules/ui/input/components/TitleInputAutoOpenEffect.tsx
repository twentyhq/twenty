import { useEffect } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { isDefined } from 'twenty-shared/utils';

type TitleInputAutoOpenEffectProps = {
  shouldOpen?: boolean;
  isOpened: boolean;
  disabled?: boolean;
  instanceId: string;
  onOpen?: () => void;
  setIsOpened: (isOpened: boolean) => void;
};

export const TitleInputAutoOpenEffect = ({
  shouldOpen,
  isOpened,
  disabled,
  instanceId,
  onOpen,
  setIsOpened,
}: TitleInputAutoOpenEffectProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    if (isDefined(shouldOpen) && shouldOpen && !isOpened && !disabled) {
      setIsOpened(true);
      pushFocusItemToFocusStack({
        focusId: instanceId,
        component: {
          type: FocusComponentType.TEXT_INPUT,
          instanceId: instanceId,
        },
        globalHotkeysConfig: {
          enableGlobalHotkeysConflictingWithKeyboard: false,
        },
      });
      onOpen?.();
    }
  }, [
    shouldOpen,
    isOpened,
    disabled,
    instanceId,
    pushFocusItemToFocusStack,
    onOpen,
    setIsOpened,
  ]);

  return null;
};
