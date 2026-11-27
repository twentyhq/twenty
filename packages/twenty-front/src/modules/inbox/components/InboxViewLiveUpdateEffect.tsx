import { inboxNamesByLegacyNameSelector } from '@/ai-chat/states/selectors/inboxNamesByLegacyNameSelector';
import { useListenToObjectRecordOperationBrowserEvent } from '@/browser-event/hooks/useListenToObjectRecordOperationBrowserEvent';
import { INBOX_VIEW_REFETCH_DEBOUNCE_IN_MS } from '@/inbox/constants/InboxViewRefetchDebounceInMs';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useRefetchAggregateQueriesForObjectMetadataItem } from '@/object-record/hooks/useRefetchAggregateQueriesForObjectMetadataItem';
import { useRefetchFindManyRecords } from '@/object-record/hooks/useRefetchFindManyRecords';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { isDefined } from 'twenty-shared/utils';
import { useDebouncedCallback } from 'use-debounce';

// The view preset reads the member's participant row, which thread events do not carry
type InboxViewLiveUpdateEffectProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const InboxViewLiveUpdateEffect = ({
  objectMetadataItem,
}: InboxViewLiveUpdateEffectProps) => {
  const inboxNamesByLegacyName = useAtomStateValue(
    inboxNamesByLegacyNameSelector,
  );
  const participantObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName: inboxNamesByLegacyName.agentChatThreadParticipant,
      objectNameType: 'singular',
    },
  );

  const { refetchFindManyRecords } = useRefetchFindManyRecords({
    objectMetadataNamePlural: objectMetadataItem.namePlural,
  });

  const { refetchAggregateQueriesForObjectMetadataItem } =
    useRefetchAggregateQueriesForObjectMetadataItem();

  const debouncedRefetchInboxViewThreads = useDebouncedCallback(() => {
    void refetchFindManyRecords();
    void refetchAggregateQueriesForObjectMetadataItem({ objectMetadataItem });
  }, INBOX_VIEW_REFETCH_DEBOUNCE_IN_MS);

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: debouncedRefetchInboxViewThreads,
    objectMetadataItemId: objectMetadataItem.id,
  });

  useListenToObjectRecordOperationBrowserEvent({
    onObjectRecordOperationBrowserEvent: debouncedRefetchInboxViewThreads,
    objectMetadataItemId: participantObjectMetadataItem?.id,
    enabled: isDefined(participantObjectMetadataItem),
  });

  return null;
};
