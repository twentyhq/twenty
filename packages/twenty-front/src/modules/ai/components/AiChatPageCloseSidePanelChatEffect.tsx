import { useStore } from 'jotai';
import { useEffect } from 'react';
import { isSidePanelItemShowingAiChat } from '@/ai/utils/isSidePanelItemShowingAiChat';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { objectMetadataItemByUniversalIdentifierFamilySelector } from '@/object-metadata/states/objectMetadataItemByUniversalIdentifierFamilySelector';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';

// The page and a chat in the side panel would share one current chat
export const AiChatPageCloseSidePanelChatEffect = () => {
  const store = useStore();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const chatObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemByUniversalIdentifierFamilySelector,
    STANDARD_OBJECTS.agentChatThread.universalIdentifier,
  );

  useEffect(() => {
    if (!store.get(isSidePanelOpenedState.atom)) {
      return;
    }

    if (
      isSidePanelItemShowingAiChat({
        sidePanelItem: store.get(sidePanelNavigationStackState.atom).at(-1),
        chatObjectNameSingular: chatObjectMetadataItem?.nameSingular,
      })
    ) {
      void closeSidePanelMenu();
    }
  }, [store, closeSidePanelMenu, chatObjectMetadataItem?.nameSingular]);

  return null;
};
