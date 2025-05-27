import { Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentIdsToDelete } from '@/activities/utils/getActivityAttachmentIdsToDelete';

describe('getActivityAttachmentIdsToDelete', () => {
  it('should not return any ids if attachment are present in the body', () => {
    const attachments = [
      {
        id: '1',
        fullPath: '/files/attachment/test.txt',
      },
      {
        id: '2',
        fullPath: '/files/attachment/test2.txt',
      },
    ] as Attachment[];

    const attachmentIdsToDelete = getActivityAttachmentIdsToDelete(
      '/files/attachment/test2.txt /files/attachment/test.txt',
      attachments,
    );
    expect(attachmentIdsToDelete).toEqual([]);
  });

  it('should return the ids of the attachments that are not present in the body', () => {
    const attachments = [
      {
        id: '1',
        fullPath: '/files/attachment/test.txt',
      },
      {
        id: '2',
        fullPath: '/files/attachment/test2.txt',
      },
    ] as Attachment[];

    const attachmentIdsToDelete = getActivityAttachmentIdsToDelete(
      '/files/attachment/test2.txt',
      attachments,
    );
    expect(attachmentIdsToDelete).toEqual(['1']);
  });
});
