import { useCallback } from 'react';
import { FrontComponentInputFocusContext } from 'twenty-front-component-renderer';

import { FrontComponentInputFocusCleanupEffect } from '@/front-components/components/FrontComponentInputFocusCleanupEffect';
import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

type FrontComponentRendererProviderProps = {
  frontComponentId: string;
  children: React.ReactNode;
};

export const FrontComponentRendererProvider = ({
  frontComponentId,
  children,
}: FrontComponentRendererProviderProps) => {
  const focusId = `front-component-input-focus-${frontComponentId}`;

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();
  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const setEditableFocused = useCallback(
    (focused: boolean) => {
      if (focused) {
        pushFocusItemToFocusStack({
          focusId,
          component: {
            type: FocusComponentType.TEXT_INPUT,
            instanceId: focusId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        });
      } else {
        removeFocusItemFromFocusStackById({ focusId });
      }
    },
    [focusId, pushFocusItemToFocusStack, removeFocusItemFromFocusStackById],
  );

  return (
    <FrontComponentInstanceContext.Provider
      value={{ instanceId: frontComponentId }}
    >
      <FrontComponentInputFocusContext.Provider value={setEditableFocused}>
        <FrontComponentInputFocusCleanupEffect focusId={focusId} />
        {children}
      </FrontComponentInputFocusContext.Provider>
    </FrontComponentInstanceContext.Provider>
  );
};
