import { CoreObjectNameSingular } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AiChatSuggestedPromptsContext } from '@/ai/types/AiChatSuggestedPromptsContext';
import { getAiChatBrowsingContextType } from '@/ai/utils/getAiChatBrowsingContextType';
import { getAiChatContextStoreInstanceId } from '@/ai/utils/getAiChatContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isCurrentPathAiChatPage } from '~/utils/isCurrentPathAiChatPage';

// Reactive counterpart of useGetBrowsingContext, which reads the store only at send time.
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

    const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === contextStoreCurrentObjectMetadataItemId,
    );

    const browsingContextType = getAiChatBrowsingContextType({
      pageType: contextStoreCurrentPageType,
      viewType: contextStoreCurrentViewType,
    });

    // The chat page is the chat's own record page, not what the user is asking about.
    if (
      !isDefined(objectMetadataItem) ||
      !isDefined(browsingContextType) ||
      objectMetadataItem.nameSingular === CoreObjectNameSingular.AgentChatThread
    ) {
      return null;
    }

    return {
      browsingContextType,
      objectNameSingular: objectMetadataItem.nameSingular,
    };
  };
