import { getActivityAttachmentPathsAndName } from '@/activities/utils/getActivityAttachmentPathsAndName';

describe('getActivityAttachmentPathsAndName', () => {
  it('should return the file paths and names from the activity blocknote', () => {
    const activityBlocknote = JSON.stringify([
      { type: 'paragraph', props: { text: 'test' } },
      {
        type: 'image',
        props: {
          url: 'https://example.com/files/image/image.jpg?queryParam=value',
          name: 'image',
        },
      },
      {
        type: 'file',
        props: {
          url: 'https://example.com/files/file/file.pdf?queryParam=value',
          name: 'file',
        },
      },
      {
        type: 'video',
        props: {
          url: 'https://example.com/files/video/video.mp4?queryParam=value',
          name: 'video',
        },
      },
      {
        type: 'audio',
        props: {
          url: 'https://example.com/files/audio/audio.mp3?queryParam=value',
          name: 'audio',
        },
      },
    ]);
    const res = getActivityAttachmentPathsAndName(activityBlocknote);

    expect(res).toEqual([
      {
        path: 'https://example.com/files/image/image.jpg?queryParam=value',
        name: 'image',
      },
      {
        path: 'https://example.com/files/file/file.pdf?queryParam=value',
        name: 'file',
      },
      {
        path: 'https://example.com/files/video/video.mp4?queryParam=value',
        name: 'video',
      },
      {
        path: 'https://example.com/files/audio/audio.mp3?queryParam=value',
        name: 'audio',
      },
    ]);
  });
});
