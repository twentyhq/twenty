import { useCallback } from 'react';
import {
  FrontComponentInputFocusContext,
  FrontComponentIframeHostContext,
} from 'twenty-front-component-renderer';

import { FrontComponentInputFocusCleanupEffect } from '@/front-components/components/FrontComponentInputFocusCleanupEffect';
import { FrontComponentManagedIframe } from '@/front-components/media-session/components/FrontComponentManagedIframe';
import { FrontComponentIframeOwnerProvider } from '@/front-components/media-session/contexts/FrontComponentIframeOwnerContext';
import { FrontComponentInstanceContext } from '@/front-components/states/contexts/FrontComponentInstanceContext';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type IframeMediaPermission } from 'twenty-shared/types';

type FrontComponentRendererProviderProps = {
  frontComponentId: string;
  applicationId: string;
  applicationName: string;
  applicationGrantedIframeMediaPermissions: readonly IframeMediaPermission[];
  children: React.ReactNode;
};

export const FrontComponentRendererProvider = ({
  frontComponentId,
  applicationId,
  applicationName,
  applicationGrantedIframeMediaPermissions,
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
        <FrontComponentIframeOwnerProvider
          value={{
            owner: {
              type: 'application',
              id: applicationId,
              name: applicationName,
            },
            iframeMediaPermissions: applicationGrantedIframeMediaPermissions,
          }}
        >
          <FrontComponentIframeHostContext.Provider
            value={FrontComponentManagedIframe}
          >
            {children}
          </FrontComponentIframeHostContext.Provider>
        </FrontComponentIframeOwnerProvider>
      </FrontComponentInputFocusContext.Provider>
    </FrontComponentInstanceContext.Provider>
  );
};
