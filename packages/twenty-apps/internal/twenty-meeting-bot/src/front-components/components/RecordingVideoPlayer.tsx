import styled from '@emotion/styled';
import { type SyntheticEvent, useState } from 'react';

import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';

const DEFAULT_VIDEO_ASPECT_RATIO = 16 / 9;

const StyledVideoWrapper = styled.div`
  flex-shrink: 0;
  margin-inline: auto;
  overflow: hidden;
  padding: ${recordingThemeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledVideo = styled.video<{ $videoAspectRatio: number }>`
  accent-color: ${recordingThemeCssVariables.accent.primary};
  aspect-ratio: ${({ $videoAspectRatio }) => $videoAspectRatio};
  background: ${recordingThemeCssVariables.background.primary};
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  color-scheme: light dark;
  display: block;
  height: auto;
  object-fit: contain;
  width: 100%;
`;

type RecordingVideoPlayerProps = {
  src: string;
  extension: string;
  onTimeUpdate: (currentTimeSeconds: number) => void;
};

export const RecordingVideoPlayer = ({
  src,
  extension,
  onTimeUpdate,
}: RecordingVideoPlayerProps) => {
  const [videoAspectRatio, setVideoAspectRatio] = useState(
    DEFAULT_VIDEO_ASPECT_RATIO,
  );

  const handleLoadedMetadata = (
    event: SyntheticEvent<HTMLVideoElement>,
  ) => {
    const { videoWidth, videoHeight } = event.currentTarget;

    if (
      videoWidth > 0 &&
      videoHeight > 0
    ) {
      setVideoAspectRatio(videoWidth / videoHeight);
    }
  };

  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    onTimeUpdate(event.currentTarget.currentTime);
  };

  return (
    <StyledVideoWrapper>
      <StyledVideo
        $videoAspectRatio={videoAspectRatio}
        controls
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
      >
        <source src={src} type={`video/${extension}`} />
      </StyledVideo>
    </StyledVideoWrapper>
  );
};
