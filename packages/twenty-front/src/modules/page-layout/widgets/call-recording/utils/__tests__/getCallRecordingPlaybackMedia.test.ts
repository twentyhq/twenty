import { type FieldFilesValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { getCallRecordingPlaybackMedia } from '@/page-layout/widgets/call-recording/utils/getCallRecordingPlaybackMedia';

const VIDEO_URL = 'https://files.example.com/recording.mp4';
const AUDIO_URL = 'https://files.example.com/recording.mp3';

const makeFile = (url?: string): FieldFilesValue => ({
  fileId: 'recording-file',
  label: 'recording',
  extension: 'mp4',
  url,
});

describe('getCallRecordingPlaybackMedia', () => {
  it('returns video when only video is available', () => {
    expect(
      getCallRecordingPlaybackMedia({ video: [makeFile(VIDEO_URL)] }),
    ).toEqual({ url: VIDEO_URL, kind: 'video' });
  });

  it('returns audio when only audio is available', () => {
    expect(
      getCallRecordingPlaybackMedia({ audio: [makeFile(AUDIO_URL)] }),
    ).toEqual({ url: AUDIO_URL, kind: 'audio' });
  });

  it('prefers video when both are available', () => {
    expect(
      getCallRecordingPlaybackMedia({
        video: [makeFile(VIDEO_URL)],
        audio: [makeFile(AUDIO_URL)],
      }),
    ).toEqual({ url: VIDEO_URL, kind: 'video' });
  });

  it.each([
    undefined,
    {},
    { video: null, audio: null },
    { video: [], audio: [] },
  ])(
    'returns undefined when neither media is available: %j',
    (callRecording) => {
      expect(getCallRecordingPlaybackMedia(callRecording)).toBeUndefined();
    },
  );

  it.each([undefined, '', '   ', '\t\n'])(
    'falls back to audio when the video url is blank: %j',
    (url) => {
      expect(
        getCallRecordingPlaybackMedia({
          video: [makeFile(url)],
          audio: [makeFile(AUDIO_URL)],
        }),
      ).toEqual({ url: AUDIO_URL, kind: 'audio' });
    },
  );

  it('returns the first playable file, skipping blank urls', () => {
    expect(
      getCallRecordingPlaybackMedia({
        video: [makeFile(), makeFile(' '), makeFile(VIDEO_URL)],
      }),
    ).toEqual({ url: VIDEO_URL, kind: 'video' });
    expect(
      getCallRecordingPlaybackMedia({
        audio: [makeFile(), makeFile(' '), makeFile(AUDIO_URL)],
      }),
    ).toEqual({ url: AUDIO_URL, kind: 'audio' });
  });

  it('returns undefined when both files have blank urls', () => {
    expect(
      getCallRecordingPlaybackMedia({
        video: [makeFile('')],
        audio: [makeFile(' ')],
      }),
    ).toBeUndefined();
  });
});
