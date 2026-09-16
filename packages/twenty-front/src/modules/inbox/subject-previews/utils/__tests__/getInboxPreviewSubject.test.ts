import { getInboxPreviewSubject } from '@/inbox/subject-previews/utils/getInboxPreviewSubject';
import { type InboxItemRecord } from '~/generated/graphql';

const OBJECT_NAMES: Record<string, string> = {
  'thread-object': 'messageThread',
  'company-object': 'company',
  'person-object': 'person',
};

const getObjectNameSingular = (objectMetadataId: string) =>
  OBJECT_NAMES[objectMetadataId];
const hasPreview = (objectNameSingular: string) =>
  objectNameSingular === 'messageThread';

const buildRecord = (
  objectMetadataId: string,
  recordId: string | null,
): InboxItemRecord =>
  ({ objectMetadataId, recordId, label: recordId ?? '' }) as InboxItemRecord;

describe('getInboxPreviewSubject', () => {
  it('should take the subject even when its object has no preview of its own', () => {
    const subject = getInboxPreviewSubject({
      inboxItem: {
        subjectObjectMetadataId: 'company-object',
        subjectRecordId: 'acme',
        records: [buildRecord('thread-object', 'thread-1')],
      },
      getObjectNameSingular,
      hasPreview,
    });

    expect(subject).toEqual({
      objectNameSingular: 'company',
      recordId: 'acme',
    });
  });

  it('should fall back to the first record row whose object has a preview', () => {
    const subject = getInboxPreviewSubject({
      inboxItem: {
        subjectObjectMetadataId: null,
        subjectRecordId: null,
        records: [
          buildRecord('person-object', 'priya'),
          buildRecord('thread-object', null),
          buildRecord('thread-object', 'thread-2'),
        ],
      },
      getObjectNameSingular,
      hasPreview,
    });

    expect(subject).toEqual({
      objectNameSingular: 'messageThread',
      recordId: 'thread-2',
    });
  });

  it('should return nothing when neither the subject nor a record can be previewed', () => {
    const subject = getInboxPreviewSubject({
      inboxItem: {
        subjectObjectMetadataId: null,
        subjectRecordId: null,
        records: [buildRecord('person-object', 'priya')],
      },
      getObjectNameSingular,
      hasPreview,
    });

    expect(subject).toBeNull();
  });
});
