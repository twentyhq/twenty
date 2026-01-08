import { useEffect } from 'react';

import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { isDefined } from 'twenty-shared/utils';

type TitleInputAutoOpenEffectProps = {
  shouldFocus?: boolean;
  isOpened: boolean;
  disabled?: boolean;
  instanceId: string;
  onFocus?: () => void;
  setIsOpened: (isOpened: boolean) => void;
};

export const TitleInputAutoOpenEffect = ({
  shouldFocus,
  isOpened,
  disabled,
  instanceId,
  onFocus,
  setIsOpened,
}: TitleInputAutoOpenEffectProps) => {
  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  useEffect(() => {
    if (isDefined(shouldFocus) && shouldFocus && !isOpened && !disabled) {
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
      onFocus?.();
    }
  }, [
    shouldFocus,
    isOpened,
    disabled,
    instanceId,
    pushFocusItemToFocusStack,
    onFocus,
    setIsOpened,
  ]);

  return null;
};
