import { type JSONContent } from '@tiptap/core';

import { type Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentIdsAndNameToUpdate } from '@/activities/utils/getActivityAttachmentIdsAndNameToUpdate';

const buildDocument = (content: JSONContent[]) =>
  JSON.stringify({ type: 'doc', attrs: { schemaVersion: 1 }, content });

describe('getActivityAttachmentIdsAndNameToUpdate', () => {
  it('should return an empty array when attachment names are not changed in the body', () => {
    const attachments = [
      {
        id: '1',
        file: [{ url: 'https://exemple.com/files/images/test.txt' }],
        name: 'image',
      },
      {
        id: '2',
        file: [{ url: 'https://exemple.com/files/images/test2.txt' }],
        name: 'image1',
      },
    ] as Attachment[];

    const activityBody = buildDocument([
      {
        type: 'file',
        attrs: {
          url: 'https://exemple.com/files/images/test.txt',
          name: 'image',
        },
      },
      {
        type: 'file',
        attrs: {
          url: 'https://exemple.com/files/images/test2.txt',
          name: 'image1',
        },
      },
    ]);
    const attachmentIdsAndNameToUpdate =
      getActivityAttachmentIdsAndNameToUpdate(activityBody, attachments);
    expect(attachmentIdsAndNameToUpdate).toEqual([]);
  });

  it('should return only the IDs and new names of attachments whose names were changed in the body', () => {
    const attachments = [
      {
        id: '1',
        file: [{ url: 'https://exemple.com/files/images/test.txt' }],
        name: 'image',
      },
      {
        id: '2',
        file: [{ url: 'https://exemple.com/files/images/test2.txt' }],
        name: 'image1',
      },
    ] as Attachment[];

    const activityBody = buildDocument([
      {
        type: 'file',
        attrs: {
          url: 'https://exemple.com/files/images/test.txt',
          name: 'image',
        },
      },
      {
        type: 'file',
        attrs: {
          url: 'https://exemple.com/files/images/test2.txt',
          name: 'image4',
        },
      },
    ]);
    const attachmentIdsAndNameToUpdate =
      getActivityAttachmentIdsAndNameToUpdate(activityBody, attachments);
    expect(attachmentIdsAndNameToUpdate).toEqual([{ id: '2', name: 'image4' }]);
  });
});
