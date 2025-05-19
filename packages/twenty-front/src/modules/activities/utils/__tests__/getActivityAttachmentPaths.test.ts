import { getActivityAttachmentPaths } from '@/activities/utils/getActivityAttachmentPaths';

describe('getActivityAttachmentPaths', () => {
  it('should return the file paths from the activity blocknote', () => {
    const activityBlocknote = JSON.stringify([
      { type: 'paragraph', props: { text: 'test' } },
      {
        type: 'image',
        props: {
          url: 'https://example.com/files/attachment/image.jpg?queryParam=value',
        },
      },
      {
        type: 'file',
        props: {
          url: 'https://example.com/files/attachment/file.pdf?queryParam=value',
        },
      },
      {
        type: 'video',
        props: {
          url: 'https://example.com/files/attachment/video.mp4?queryParam=value',
        },
      },
      {
        type: 'audio',
        props: {
          url: 'https://example.com/files/attachment/audio.mp3?queryParam=value',
        },
      },
    ]);
    const res = getActivityAttachmentPaths(activityBlocknote);
    expect(res).toEqual([
      'attachment/image.jpg',
      'attachment/file.pdf',
      'attachment/video.mp4',
      'attachment/audio.mp3',
    ]);
  });
});
