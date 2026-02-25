import { AudioPlayer } from 'src/components/AudioPlayer';
import { VideoPlayer } from 'src/components/VideoPlayer';
import { useCallRecording } from 'src/hooks/useCallRecording';
import { isAudioExtension } from 'src/utils/is-audio-extension';
import { isVideoExtension } from 'src/utils/is-video-extension';
import { MEDIA_PLAYER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/media-player-front-component-universal-identifier';
import { defineFrontComponent } from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

export const MediaPlayer = () => {
  const { callRecording, loading, error } = useCallRecording();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isDefined(error)) {
    throw error;
  }

  const recordingFile = callRecording?.recordingFile[0];

  const recordingFileUrl = recordingFile?.url;
  const recordingFileExtension = recordingFile?.extension;

  if (!isDefined(recordingFileUrl)) {
    throw new Error('Recording file url not found');
  }

  if (!isDefined(recordingFileExtension)) {
    throw new Error('Recording file extension not found');
  }

  const normalizedExtension = recordingFileExtension
    .toLowerCase()
    .replace(/^\./, '');

  if (isAudioExtension(normalizedExtension)) {
    return (
      <AudioPlayer src={recordingFileUrl} extension={normalizedExtension} />
    );
  }

  if (isVideoExtension(normalizedExtension)) {
    return (
      <VideoPlayer src={recordingFileUrl} extension={normalizedExtension} />
    );
  }

  throw new Error('Unsupported file extension');
};

export default defineFrontComponent({
  universalIdentifier: MEDIA_PLAYER_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Call Recording Media Player',
  description: 'A media player for call recordings',
  component: MediaPlayer,
});
