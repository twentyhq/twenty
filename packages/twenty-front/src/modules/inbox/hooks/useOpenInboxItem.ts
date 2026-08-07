import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type InboxItem } from '~/generated/graphql';

// Opening an item opens the thing it is about, in the same side panel a record
// opens in. The notification context and its actions ride above it rather than
// standing in for it, so a failed run looks like a run and a conversation
// comes with its composer.
export const useOpenInboxItem = () => {
  const { markInboxItemRead } = useInboxItemActions();
  const { openAskAiThread } = useOpenAskAiThread();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { getIcon } = useIcons();
  const setSelectedInboxItemId = useSetAtomState(selectedInboxItemIdState);
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const openInboxItem = useCallback(
    (inboxItem: InboxItem) => {
      if (!isDefined(inboxItem.readAt)) {
        void markInboxItemRead({ inboxItemId: inboxItem.id });
      }

      setSelectedInboxItemId(inboxItem.id);

      if (isDefined(inboxItem.threadId)) {
        openAskAiThread(inboxItem.threadId);

        return;
      }

      const objectMetadataItem = isDefined(inboxItem.subjectObjectMetadataId)
        ? objectMetadataItemsByIdMap.get(inboxItem.subjectObjectMetadataId)
        : undefined;

      if (
        isDefined(objectMetadataItem) &&
        isDefined(inboxItem.subjectRecordId)
      ) {
        openRecordInSidePanel({
          recordId: inboxItem.subjectRecordId,
          objectNameSingular: objectMetadataItem.nameSingular,
          resetNavigationStack: true,
        });

        return;
      }

      // An item with no subject still opens the panel: the context bar and its
      // actions are the whole of it
      navigateSidePanel({
        page: SidePanelPages.ViewInboxItem,
        pageTitle: inboxItem.inboxItemType.label,
        pageIcon: getIcon(inboxItem.inboxItemType.icon),
        resetNavigationStack: true,
      });
    },
    [
      getIcon,
      markInboxItemRead,
      navigateSidePanel,
      objectMetadataItemsByIdMap,
      openAskAiThread,
      openRecordInSidePanel,
      setSelectedInboxItemId,
    ],
  );

  return { openInboxItem };
};
