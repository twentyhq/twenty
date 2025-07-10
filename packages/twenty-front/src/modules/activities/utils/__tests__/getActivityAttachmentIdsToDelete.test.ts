import { Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentIdsToDelete } from '@/activities/utils/getActivityAttachmentIdsToDelete';

describe('getActivityAttachmentIdsToDelete', () => {
  it('should not return any ids if attachment are present in the body', () => {
    const attachments = [
      {
        id: '1',
        fullPath: '/files/images/test.txt',
      },
      {
        id: '2',
        fullPath: '/files/images/test2.txt',
      },
    ] as Attachment[];
    const newActivityBody = JSON.stringify([
      {
        type: 'file',
        props: { url: '/files/images/test.txt' },
      },
      {
        type: 'file',
        props: { url: '/files/images/test2.txt' },
      },
    ]);
    const oldActivityBody = JSON.stringify([
      {
        type: 'file',
        props: { url: '/files/images/test.txt' },
      },
      {
        type: 'file',
        props: { url: '/files/images/test2.txt' },
      },
    ]);
    const attachmentIdsToDelete = getActivityAttachmentIdsToDelete(
      newActivityBody,
      attachments,
      oldActivityBody,
    );
    expect(attachmentIdsToDelete).toEqual([]);
  });

  it('should return the ids of the attachments that are not present in the body', () => {
    const attachments = [
      {
        id: '1',
        fullPath: '/files/images/test.txt',
      },
      {
        id: '2',
        fullPath: '/files/images/test2.txt',
      },
    ] as Attachment[];
    const newActivityBody = JSON.stringify([
      {
        type: 'file',
        props: { url: '/files/images/test.txt' },
      },
    ]);
    const oldActivityBody = JSON.stringify([
      {
        type: 'file',
        props: { url: '/files/images/test.txt' },
      },
      {
        type: 'file',
        props: { url: '/files/images/test2.txt' },
      },
    ]);
    const attachmentIdsToDelete = getActivityAttachmentIdsToDelete(
      newActivityBody,
      attachments,
      oldActivityBody,
    );
    expect(attachmentIdsToDelete).toEqual(['2']);
  });
});
