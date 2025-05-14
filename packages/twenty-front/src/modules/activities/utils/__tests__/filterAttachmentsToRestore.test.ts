import { Attachment } from '@/activities/files/types/Attachment';
import { filterAttachmentsToRestore } from '../filterAttachmentsToRestore';

describe('filterAttachmentsToRestore', () => {
  it('should not return any ids if there are no attachment paths to restore', () => {
    const softDeletedAttachments = [
      {
        id: '1',
        fullPath: 'test.txt',
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
      ['/files/attachment/test.txt'],
      [],
    );
    expect(attachmentIdsToRestore).toEqual([]);
  });

  it('should return the ids of the soft deleted attachments that are present in the attachment paths to restore', () => {
    const softDeletedAttachments = [
      {
        id: '1',
        fullPath: '/files/attachment/test.txt',
      },
      {
        id: '2',
        fullPath: '/files/attachment/test2.txt',
      },
    ] as Attachment[];
    const attachmentIdsToRestore = filterAttachmentsToRestore(
      ['attachment/test.txt'],
      softDeletedAttachments,
    );
    expect(attachmentIdsToRestore).toEqual(['1']);
  });
});
