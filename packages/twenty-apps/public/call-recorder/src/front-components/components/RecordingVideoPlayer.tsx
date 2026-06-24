import styled from '@emotion/styled';
import { memo, type SyntheticEvent } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';


const DEFAULT_VIDEO_ASPECT_RATIO = '16 / 9';

const StyledVideoViewport = styled.div`
  aspect-ratio: ${DEFAULT_VIDEO_ASPECT_RATIO};
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  overflow: hidden;
  width: 100%;
`;

const StyledVideo = styled.video`
  accent-color: ${themeCssVariables.accent.accent9};
  background: ${themeCssVariables.background.primary};
  color-scheme: light dark;
  display: block;
  height: 100%;
  object-fit: contain;
  width: 100%;
`;

type RecordingVideoPlayerProps = {
  src: string | undefined;
  onTimeUpdate: (currentTimeSeconds: number) => void;
};

const RecordingVideoPlayerComponent = ({
  src,
  onTimeUpdate,
}: RecordingVideoPlayerProps) => {
  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    onTimeUpdate(event.currentTarget.currentTime);
  };

  return (
    <StyledVideoViewport>
      <StyledVideo
        controls
        playsInline
        preload="metadata"
        src={src}
        onTimeUpdate={handleTimeUpdate}
      />
    </StyledVideoViewport>
  );
};

export const RecordingVideoPlayer = memo(RecordingVideoPlayerComponent);
