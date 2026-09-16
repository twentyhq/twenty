import { getInboxItemMessageThreadId } from '@/inbox/utils/getInboxItemMessageThreadId';
import { type InboxItemRecord } from '~/generated/graphql';

const MESSAGE_THREAD_OBJECT_METADATA_ID = 'message-thread-object-metadata-id';
const COMPANY_OBJECT_METADATA_ID = 'company-object-metadata-id';

const buildRecord = (
  overrides: Partial<InboxItemRecord> & Pick<InboxItemRecord, 'id'>,
): InboxItemRecord => ({
  __typename: 'InboxItemRecord',
  position: 0,
  label: 'A record',
  subtitle: null,
  relationLabel: null,
  objectMetadataId: null,
  recordId: null,
  ...overrides,
});

describe('getInboxItemMessageThreadId', () => {
  it('should read the thread from the subject when the subject is a thread', () => {
    expect(
      getInboxItemMessageThreadId({
        inboxItem: {
          subjectObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
          subjectRecordId: 'thread-1',
          records: [],
        },
        messageThreadObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
      }),
    ).toBe('thread-1');
  });

  it('should fall back to the first record row that is a thread', () => {
    expect(
      getInboxItemMessageThreadId({
        inboxItem: {
          subjectObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
          subjectRecordId: 'company-1',
          records: [
            buildRecord({ id: 'person-row' }),
            buildRecord({
              id: 'thread-row',
              objectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
              recordId: 'thread-2',
            }),
          ],
        },
        messageThreadObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
      }),
    ).toBe('thread-2');
  });

  it('should return null when nothing on the item is a thread', () => {
    expect(
      getInboxItemMessageThreadId({
        inboxItem: {
          subjectObjectMetadataId: COMPANY_OBJECT_METADATA_ID,
          subjectRecordId: 'company-1',
          records: [buildRecord({ id: 'person-row' })],
        },
        messageThreadObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
      }),
    ).toBeNull();
  });

  // The object may not be in the metadata cache yet on first paint.
  it('should return null while the thread object is unknown', () => {
    expect(
      getInboxItemMessageThreadId({
        inboxItem: {
          subjectObjectMetadataId: MESSAGE_THREAD_OBJECT_METADATA_ID,
          subjectRecordId: 'thread-1',
          records: [],
        },
        messageThreadObjectMetadataId: undefined,
      }),
    ).toBeNull();
  });
});
