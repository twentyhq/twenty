import { AudioPlayer } from 'src/components/AudioPlayer';
import { VideoPlayer } from 'src/components/VideoPlayer';
import { useCallRecording } from 'src/hooks/useCallRecording';
import { isAudioExtension } from 'src/utils/is-audio-extension';
import { isVideoExtension } from 'src/utils/is-video-extension';
import { defineFrontComponent } from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

export const MediaPlayer = () => {
  const { callRecording } = useCallRecording();

  const recordingFile = callRecording?.recordingFile[0];

  const recordingFileUrl = recordingFile?.url;
  const recordingFileExtension = recordingFile?.extension;

  if (!isDefined(recordingFileUrl)) {
    throw new Error('Recording file url not found');
  }

  if (!isDefined(recordingFileExtension)) {
    throw new Error('Recording file extension not found');
  }

  if (isAudioExtension(recordingFileExtension)) {
    return (
      <AudioPlayer
        src={recordingFileUrl}
        extension={recordingFileExtension}
      />
    );
  }

  if (isVideoExtension(recordingFileExtension)) {
    return (
      <VideoPlayer
        src={recordingFileUrl}
        extension={recordingFileExtension}
      />
    );
  }

  throw new Error('Unsupported file extension');
};

export default defineFrontComponent({
  universalIdentifier: '9f3bbb39-042d-4216-b8fc-bedfc3487208',
  name: 'Call Recording Media Player',
  description: 'A media player for call recordings',
  component: MediaPlayer,
});
