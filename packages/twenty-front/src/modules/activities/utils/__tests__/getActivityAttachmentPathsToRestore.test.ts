import { Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentPathsToRestore } from '@/activities/utils/getActivityAttachmentPathsToRestore';

describe('getActivityAttachmentPathsToRestore', () => {
  it('should not return any attachment paths to restore if there are no paths in body', () => {
    const newActivityBody = JSON.stringify([
      {
        type: 'paragraph',
      },
    ]);

    const oldActivityAttachments = [
      {
        id: '1',
        fullPath: '/files/attachment/test.txt',
      },
    ] as Attachment[];

    const attachmentPathsToRestore = getActivityAttachmentPathsToRestore(
      newActivityBody,
      oldActivityAttachments,
    );
    expect(attachmentPathsToRestore).toEqual([]);
  });

  it('should return the attachment paths to restore if paths in body are not present in attachments', () => {
    const newActivityBody = JSON.stringify([
      {
        type: 'file',
        props: { url: '/files/attachment/test.txt' },
      },
      {
        type: 'file',
        props: { url: '/files/attachment/test2.txt' },
      },
    ]);

    const oldActivityAttachments = [
      {
        id: '1',
        fullPath: '/files/attachment/test.txt',
      },
    ] as Attachment[];

    const attachmentPathsToRestore = getActivityAttachmentPathsToRestore(
      newActivityBody,
      oldActivityAttachments,
    );
    expect(attachmentPathsToRestore).toEqual(['attachment/test2.txt']);
  });
});
