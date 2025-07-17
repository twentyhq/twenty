import { Attachment } from '@/activities/files/types/Attachment';
import { getActivityAttachmentIdsAndNameToUpdate } from '@/activities/utils/getActivityAttachmentIdsAndNameToUpdate';

describe('getActivityAttachmentIdsAndNameToUpdate', () => {
  it('should return an empty array when attachment names are not changed in the body', () => {
    const attachments = [
      {
        id: '1',
        fullPath: '/files/images/test.txt',
        name: 'image',
      },
      {
        id: '2',
        fullPath: '/files/images/test2.txt',
        name: 'image1',
      },
    ] as Attachment[];

    const activityBody = JSON.stringify([
      {
        type: 'file',
        props: { url: '/files/images/test.txt', name: 'image' },
      },
      {
        type: 'file',
        props: { url: '/files/images/test2.txt', name: 'image1' },
      },
    ]);
    const attachmentIdsAdnameToUpdate = getActivityAttachmentIdsAndNameToUpdate(
      activityBody,
      attachments,
    );
    expect(attachmentIdsAdnameToUpdate).toEqual([]);
  });

  it('should return only the IDs and new names of attachments whose names were changed in the body', () => {
    const attachments = [
      {
        id: '1',
        fullPath: '/files/images/test.txt',
        name: 'image',
      },
      {
        id: '2',
        fullPath: '/files/images/test2.txt',
        name: 'image1',
      },
    ] as Attachment[];

    const activityBody = JSON.stringify([
      {
        type: 'file',
        props: { url: '/files/images/test.txt', name: 'image' },
      },
      {
        type: 'file',
        props: { url: '/files/images/test2.txt', name: 'image4' },
      },
    ]);
    const attachmentIdsAdnameToUpdate = getActivityAttachmentIdsAndNameToUpdate(
      activityBody,
      attachments,
    );
    expect(attachmentIdsAdnameToUpdate).toEqual([{ id: '2', name: 'image4' }]);
  });
});
