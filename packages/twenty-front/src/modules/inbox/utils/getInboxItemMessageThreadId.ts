import { isDefined } from 'twenty-shared/utils';

import { type InboxItem } from '~/generated/graphql';

// An item about a message thread is read in that thread, so the pane needs to
// know which one. The subject wins; failing that, the first record row that is
// a thread, which is how a producer that only named records still gets one.
export const getInboxItemMessageThreadId = ({
  inboxItem,
  messageThreadObjectMetadataId,
}: {
  inboxItem: Pick<
    InboxItem,
    'subjectObjectMetadataId' | 'subjectRecordId' | 'records'
  >;
  messageThreadObjectMetadataId: string | undefined;
}): string | null => {
  if (!isDefined(messageThreadObjectMetadataId)) {
    return null;
  }

  if (
    inboxItem.subjectObjectMetadataId === messageThreadObjectMetadataId &&
    isDefined(inboxItem.subjectRecordId)
  ) {
    return inboxItem.subjectRecordId;
  }

  const threadRecord = inboxItem.records.find(
    (record) =>
      record.objectMetadataId === messageThreadObjectMetadataId &&
      isDefined(record.recordId),
  );

  return threadRecord?.recordId ?? null;
};
