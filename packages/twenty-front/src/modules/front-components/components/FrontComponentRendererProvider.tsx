import { type ComponentType, type ReactNode, useCallback } from 'react';
import {
  FrontComponentInputFocusContext,
  type SetEditableFocused,
} from 'twenty-front-component-renderer';

import { FrontComponentInputFocusCleanupEffect } from '@/front-components/components/FrontComponentInputFocusCleanupEffect';
import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';

// Bridge React 18/19 type mismatch between twenty-front and twenty-front-component-renderer
const FocusContextProvider =
  FrontComponentInputFocusContext.Provider as unknown as ComponentType<{
    value: SetEditableFocused | null;
    children: ReactNode;
  }>;

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
      <FocusContextProvider value={setEditableFocused}>
        <FrontComponentInputFocusCleanupEffect focusId={focusId} />
        {children}
      </FocusContextProvider>
    </FrontComponentInstanceContext.Provider>
  );
};
