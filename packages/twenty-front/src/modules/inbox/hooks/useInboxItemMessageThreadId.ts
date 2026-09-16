import { CoreObjectNameSingular } from 'twenty-shared/types';

import { getInboxItemMessageThreadId } from '@/inbox/utils/getInboxItemMessageThreadId';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type InboxItem } from '~/generated/graphql';

export const useInboxItemMessageThreadId = (
  inboxItem: Pick<
    InboxItem,
    'subjectObjectMetadataId' | 'subjectRecordId' | 'records'
  >,
): string | null => {
  const { objectMetadataItems } = useObjectMetadataItems();

  return (
    getInboxItemMessageThreadId({
      inboxItem,
      messageThreadObjectMetadataId: objectMetadataItems.find(
        (objectMetadataItem) =>
          objectMetadataItem.nameSingular ===
          CoreObjectNameSingular.MessageThread,
      )?.id,
    }) ?? null
  );
};
