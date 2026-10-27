import { type JSONContent } from '@tiptap/core';

import { type Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentPathsToRestore } from '@/activities/utils/getActivityAttachmentPathsToRestore';

const buildDocument = (content: JSONContent[]) =>
  JSON.stringify({ type: 'doc', attrs: { schemaVersion: 1 }, content });

describe('getActivityAttachmentPathsToRestore', () => {
  it('should not return any attachment paths to restore if there are no paths in body', () => {
    const newActivityBody = buildDocument([{ type: 'paragraph' }]);
    const oldActivityAttachments = [
      {
        id: '1',
        fullPath: 'https://example.com/files/images/test.txt',
      },
    ] as Attachment[];
    const attachmentPathsToRestore = getActivityAttachmentPathsToRestore(
      newActivityBody,
      oldActivityAttachments,
    );
    expect(attachmentPathsToRestore).toEqual([]);
  });

  it('should return the attachment paths to restore if paths in body are not present in attachments', () => {
    const newActivityBody = buildDocument([
      {
        type: 'file',
        attrs: { url: 'https://example.com/files/images/test.txt' },
      },
      {
        type: 'file',
        attrs: { url: 'https://example.com/files/images/test2.txt' },
      },
    ]);

    const oldActivityAttachments = [
      {
        id: '1',
        file: [{ url: 'https://example.com/files/images/test.txt' }],
      },
    ] as Attachment[];

    const attachmentPathsToRestore = getActivityAttachmentPathsToRestore(
      newActivityBody,
      oldActivityAttachments,
    );
    expect(attachmentPathsToRestore).toEqual([
      'https://example.com/files/images/test2.txt',
    ]);
  });
});
