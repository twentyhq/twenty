import styled from '@emotion/styled';
import { memo, type SyntheticEvent } from 'react';

import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';

const DEFAULT_VIDEO_ASPECT_RATIO = '16 / 9';

const StyledVideoWrapper = styled.div`
  background: ${recordingThemeCssVariables.background.primary};
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  box-sizing: border-box;
  flex-shrink: 0;
  margin-inline: auto;
  overflow: hidden;
  padding: ${recordingThemeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledVideoViewport = styled.div`
  aspect-ratio: ${DEFAULT_VIDEO_ASPECT_RATIO};
  background: ${recordingThemeCssVariables.background.primary};
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  overflow: hidden;
  width: 100%;
`;

const StyledVideo = styled.video`
  accent-color: ${recordingThemeCssVariables.accent.primary};
  background: ${recordingThemeCssVariables.background.primary};
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
    <StyledVideoWrapper>
      <StyledVideoViewport>
        <StyledVideo
          controls
          playsInline
          preload="metadata"
          src={src}
          onTimeUpdate={handleTimeUpdate}
        />
      </StyledVideoViewport>
    </StyledVideoWrapper>
  );
};

export const RecordingVideoPlayer = memo(RecordingVideoPlayerComponent);
