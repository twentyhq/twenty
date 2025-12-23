import { type Attachment } from '@/activities/files/types/Attachment';
import { filterAttachmentsToRestore } from '@/activities/utils/filterAttachmentsToRestore';

describe('filterAttachmentsToRestore', () => {
  it('should not return any ids if there are no attachment paths to restore', () => {
    const softDeletedAttachments = [
      {
        id: '1',
        fullPath: 'https://exemple.com/test.txt',
      },
    ] as Attachment[];
    const attachmentIdsToRestore = filterAttachmentsToRestore(
      [],
      softDeletedAttachments,
    );
    expect(attachmentIdsToRestore).toEqual([]);
  });

  it('should not return any ids if there are no soft deleted attachments', () => {
    const attachmentIdsToRestore = filterAttachmentsToRestore(
      ['https://exemple.com/files/attachment/test.txt'],
      [],
    );
    expect(attachmentIdsToRestore).toEqual([]);
  });

  it('should return the ids of the soft deleted attachments that are present in the attachment paths to restore', () => {
    const softDeletedAttachments = [
      {
        id: '1',
        fullPath: 'https://exemple.com/files/images/test.txt',
      },
      {
        id: '2',
        fullPath: 'https://exemple.com/files/images/test2.txt',
      },
    ] as Attachment[];
    const attachmentIdsToRestore = filterAttachmentsToRestore(
      ['https://exemple.com/files/images/test.txt'],
      softDeletedAttachments,
    );
    expect(attachmentIdsToRestore).toEqual(['1']);
  });
});
