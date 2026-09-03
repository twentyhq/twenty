import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type InboxItem } from '~/generated/graphql';

export type InboxItemSubject =
  | { kind: 'thread'; threadId: string }
  | { kind: 'record'; recordId: string; objectNameSingular: string }
  | null;

// What an item is about, resolved once for every surface that shows it
export const getInboxItemSubject = (
  inboxItem: Pick<
    InboxItem,
    'threadId' | 'subjectObjectMetadataId' | 'subjectRecordId'
  >,
  objectMetadataItemsByIdMap: Map<string, EnrichedObjectMetadataItem>,
): InboxItemSubject => {
  if (isDefined(inboxItem.threadId)) {
    return { kind: 'thread', threadId: inboxItem.threadId };
  }

  const objectMetadataItem = isDefined(inboxItem.subjectObjectMetadataId)
    ? objectMetadataItemsByIdMap.get(inboxItem.subjectObjectMetadataId)
    : undefined;

  if (isDefined(objectMetadataItem) && isDefined(inboxItem.subjectRecordId)) {
    return {
      kind: 'record',
      recordId: inboxItem.subjectRecordId,
      objectNameSingular: objectMetadataItem.nameSingular,
    };
  }

  return null;
};
