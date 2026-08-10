import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useOpenAskAiThread } from '@/ai/hooks/useOpenAskAiThread';
import { useInboxItemActions } from '@/inbox/hooks/useInboxItemActions';
import { selectedInboxItemIdState } from '@/inbox/states/selectedInboxItemIdState';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { type InboxItem } from '~/generated/graphql';

// The secondary way in: the item's subject opens in the same side panel a
// record opens in. The primary way is the focused page, which owns the item's
// own context and actions, so an item with no subject goes straight there.
export const useOpenInboxItemInSidePanel = (
  onSubjectlessItem: (inboxItem: InboxItem) => void,
) => {
  const { markInboxItemRead } = useInboxItemActions();
  const { openAskAiThread } = useOpenAskAiThread();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const setSelectedInboxItemId = useSetAtomState(selectedInboxItemIdState);
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const openInboxItemInSidePanel = useCallback(
    (inboxItem: InboxItem) => {
      if (inboxItem.isUnread) {
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

      // The panel only ever shows a subject, so an item without one falls back
      // to its focused page, which carries the context and the actions itself
      onSubjectlessItem(inboxItem);
    },
    [
      markInboxItemRead,
      objectMetadataItemsByIdMap,
      onSubjectlessItem,
      openAskAiThread,
      openRecordInSidePanel,
      setSelectedInboxItemId,
    ],
  );

  return { openInboxItemInSidePanel };
};
