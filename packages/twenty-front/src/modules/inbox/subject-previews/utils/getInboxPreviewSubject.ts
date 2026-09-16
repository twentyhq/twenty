import { isDefined } from 'twenty-shared/utils';

import { type InboxItem } from '~/generated/graphql';

export type InboxPreviewSubject = {
  objectNameSingular: string;
  recordId: string;
};

// What the context slot shows a preview of. The subject wins; failing that,
// the first record row whose object has a preview, which is how a producer
// that only named records still gets the thread drawn.
export const getInboxPreviewSubject = ({
  inboxItem,
  getObjectNameSingular,
  hasPreview,
}: {
  inboxItem: Pick<
    InboxItem,
    'subjectObjectMetadataId' | 'subjectRecordId' | 'records'
  >;
  getObjectNameSingular: (objectMetadataId: string) => string | undefined;
  hasPreview: (objectNameSingular: string) => boolean;
}): InboxPreviewSubject | null => {
  if (
    isDefined(inboxItem.subjectObjectMetadataId) &&
    isDefined(inboxItem.subjectRecordId)
  ) {
    const objectNameSingular = getObjectNameSingular(
      inboxItem.subjectObjectMetadataId,
    );

    if (isDefined(objectNameSingular)) {
      return { objectNameSingular, recordId: inboxItem.subjectRecordId };
    }
  }

  for (const record of inboxItem.records) {
    if (!isDefined(record.recordId) || !isDefined(record.objectMetadataId)) {
      continue;
    }

    const objectNameSingular = getObjectNameSingular(record.objectMetadataId);

    if (isDefined(objectNameSingular) && hasPreview(objectNameSingular)) {
      return { objectNameSingular, recordId: record.recordId };
    }
  }

  return null;
};
