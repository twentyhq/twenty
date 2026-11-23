import { StandardObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatSuggestedPromptsContext } from '@/ai-chat/suggested-prompts/types/AiChatSuggestedPromptsContext';
import { getAiChatBrowsingContextType } from '@/ai-chat/utils/getAiChatBrowsingContextType';
import { getAiChatContextStoreInstanceId } from '@/ai-chat/utils/getAiChatContextStoreInstanceId';
import { contextStoreCurrentCoreObjectNameComponentState } from '@/context-store/states/contextStoreCurrentCoreObjectNameComponentState';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

export const useAiChatSuggestedPromptsContext =
  (): AiChatSuggestedPromptsContext | null => {
    const isSidePanelOpened = useAtomStateValue(isSidePanelOpenedState);
    const sidePanelNavigationStack = useAtomStateValue(
      sidePanelNavigationStackState,
    );

    const contextStoreInstanceId = getAiChatContextStoreInstanceId({
      isOnAiChatPage: isCurrentPathAiChatPage(),
      isSidePanelOpened,
      currentSidePanelPageId: sidePanelNavigationStack.at(-1)?.pageId,
    });

    const contextStoreCurrentPageType = useAtomComponentStateValue(
      contextStoreCurrentPageTypeComponentState,
      contextStoreInstanceId,
    );
    const contextStoreCurrentViewType = useAtomComponentStateValue(
      contextStoreCurrentViewTypeComponentState,
      contextStoreInstanceId,
    );
    const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
      contextStoreCurrentObjectMetadataItemIdComponentState,
      contextStoreInstanceId,
    );

    const contextStoreCurrentCoreObjectName = useAtomComponentStateValue(
      contextStoreCurrentCoreObjectNameComponentState,
      contextStoreInstanceId,
    );

    const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === contextStoreCurrentObjectMetadataItemId,
    );

    const browsingContextType = getAiChatBrowsingContextType({
      pageType: contextStoreCurrentPageType,
      viewType: contextStoreCurrentViewType,
    });

    if (
      isDefined(contextStoreCurrentCoreObjectName) &&
      isDefined(browsingContextType)
    ) {
      return {
        browsingContextType,
        objectNameSingular: contextStoreCurrentCoreObjectName,
      };
    }

    if (
      !isDefined(objectMetadataItem) ||
      !isDefined(browsingContextType) ||
      objectMetadataItem.nameSingular ===
        StandardObjectNameSingular.AgentChatThread
    ) {
      return null;
    }

    return {
      browsingContextType,
      objectNameSingular: objectMetadataItem.nameSingular,
    };
  };
