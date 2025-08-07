import { type Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentIdsAndNameToUpdate } from '@/activities/utils/getActivityAttachmentIdsAndNameToUpdate';

describe('getActivityAttachmentIdsAndNameToUpdate', () => {
  it('should return an empty array when attachment names are not changed in the body', () => {
    const attachments = [
      {
        id: '1',
        fullPath: 'https://exemple.com/files/images/test.txt',
        name: 'image',
      },
      {
        id: '2',
        fullPath: 'https://exemple.com/files/images/test2.txt',
        name: 'image1',
      },
    ] as Attachment[];

    const activityBody = JSON.stringify([
      {
        type: 'file',
        props: {
          url: 'https://exemple.com/files/images/test.txt',
          name: 'image',
        },
      },
      {
        type: 'file',
        props: {
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
        fullPath: 'https://exemple.com/files/images/test.txt',
        name: 'image',
      },
      {
        id: '2',
        fullPath: 'https://exemple.com/files/images/test2.txt',
        name: 'image1',
      },
    ] as Attachment[];

    const activityBody = JSON.stringify([
      {
        type: 'file',
        props: {
          url: 'https://exemple.com/files/images/test.txt',
          name: 'image',
        },
      },
      {
        type: 'file',
        props: {
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
