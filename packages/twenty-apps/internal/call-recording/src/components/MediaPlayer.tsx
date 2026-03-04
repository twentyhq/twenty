import { AudioPlayer } from 'src/components/AudioPlayer';
import { VideoPlayer } from 'src/components/VideoPlayer';
import { isAudioExtension } from 'src/utils/is-audio-extension';
import { isVideoExtension } from 'src/utils/is-video-extension';

type MediaPlayerProps = {
  url: string;
  extension: string;
  onTimeUpdate?: (currentTimeSeconds: number) => void;
};

export const MediaPlayer = ({
  url,
  extension,
  onTimeUpdate,
}: MediaPlayerProps) => {
  const normalizedExtension = extension.toLowerCase().replace(/^\./, '');

  if (isAudioExtension(normalizedExtension)) {
    return (
      <AudioPlayer
        src={url}
        extension={normalizedExtension}
        onTimeUpdate={onTimeUpdate}
      />
    );
  }

  if (isVideoExtension(normalizedExtension)) {
    return (
      <VideoPlayer
        src={url}
        extension={normalizedExtension}
        onTimeUpdate={onTimeUpdate}
      />
    );
  }

  throw new Error('Unsupported file extension');
};
