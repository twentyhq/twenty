import { type Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentIdsToDelete } from '@/activities/utils/getActivityAttachmentIdsToDelete';

const buildDocument = (urls: string[]) =>
  JSON.stringify({
    type: 'doc',
    attrs: { schemaVersion: 1 },
    content: urls.map((url) => ({ type: 'file', attrs: { url } })),
  });

describe('getActivityAttachmentIdsToDelete', () => {
  it('should not return any ids if attachment are present in the body', () => {
    const attachments = [
      {
        id: '1',
        file: [{ url: 'https://example.com/files/images/test.txt' }],
      },
      {
        id: '2',
        file: [{ url: 'https://example.com/files/images/test2.txt' }],
      },
    ] as Attachment[];
    const newActivityBody = buildDocument([
      'https://example.com/files/images/test.txt',
      'https://example.com/files/images/test2.txt',
    ]);
    const oldActivityBody = buildDocument([
      'https://example.com/files/images/test.txt',
      'https://example.com/files/images/test2.txt',
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
        file: [{ url: 'https://example.com/files/images/test.txt' }],
      },
      {
        id: '2',
        file: [{ url: 'https://example.com/files/images/test2.txt' }],
      },
    ] as Attachment[];
    const newActivityBody = buildDocument([
      'https://example.com/files/images/test.txt',
    ]);
    const oldActivityBody = buildDocument([
      'https://example.com/files/images/test.txt',
      'https://example.com/files/images/test2.txt',
    ]);
    const attachmentIdsToDelete = getActivityAttachmentIdsToDelete(
      newActivityBody,
      attachments,
      oldActivityBody,
    );
    expect(attachmentIdsToDelete).toEqual(['2']);
  });
});
