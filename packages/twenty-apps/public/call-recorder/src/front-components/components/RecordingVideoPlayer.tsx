import styled from '@emotion/styled';
import { useState, type SyntheticEvent } from 'react';
import { CircularProgressBar } from 'twenty-ui/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const DEFAULT_VIDEO_ASPECT_RATIO = '16 / 9';

// Forces the browser to decode the first frame under preload="metadata"
// (Safari otherwise paints nothing until play). Fragments stay client-side,
// so the signed file URL is unaffected.
const FIRST_FRAME_SEEK_FRAGMENT = '#t=0.001';

type RecordingVideoLoadState = 'awaiting-first-frame' | 'ready' | 'errored';

// The max-height cap keeps the player from swallowing the tab on short
// viewports so the transcript always keeps room; the video letterboxes via
// object-fit when the cap wins over the aspect ratio.
const StyledVideoViewport = styled.div`
  aspect-ratio: ${DEFAULT_VIDEO_ASPECT_RATIO};
  background: ${() => themeCssVariables.background.primary};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  max-height: 45vh;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledVideo = styled.video<{ $isFirstFrameReady: boolean }>`
  accent-color: ${() => themeCssVariables.accent.accent9};
  background: ${() => themeCssVariables.background.primary};
  color-scheme: light dark;
  display: block;
  height: 100%;
  object-fit: contain;
  opacity: ${({ $isFirstFrameReady }) => ($isFirstFrameReady ? 1 : 0)};
  transition: opacity 200ms ease;
  width: 100%;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledBufferingOverlay = styled.div<{ $isVisible: boolean }>`
  align-items: center;
  color: ${() => themeCssVariables.font.color.tertiary};
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: ${({ $isVisible }) => ($isVisible ? 1 : 0)};
  pointer-events: none;
  position: absolute;
  transition: opacity 150ms ease
    ${({ $isVisible }) => ($isVisible ? '300ms' : '0ms')};

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0ms;
  }
`;

const StyledPlaybackErrorState = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  height: 100%;
  justify-content: center;
  padding: ${() => themeCssVariables.spacing[4]};
`;

const StyledPlaybackErrorTitle = styled.span`
  color: ${() => themeCssVariables.font.color.primary};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

const StyledPlaybackErrorDescription = styled.span`
  color: ${() => themeCssVariables.font.color.secondary};
  font-size: ${() => themeCssVariables.font.size.xs};
`;

const StyledRetryButton = styled.button`
  background: ${() => themeCssVariables.background.secondary};
  border: 1px solid ${() => themeCssVariables.border.color.medium};
  border-radius: ${() => themeCssVariables.border.radius.sm};
  color: ${() => themeCssVariables.font.color.secondary};
  cursor: pointer;
  font-family: ${() => themeCssVariables.font.family};
  font-size: ${() => themeCssVariables.font.size.sm};
  font-weight: ${() => themeCssVariables.font.weight.medium};
  margin-top: ${() => themeCssVariables.spacing[1]};
  padding: ${() => themeCssVariables.spacing[1]}
    ${() => themeCssVariables.spacing[3]};

  &:hover {
    background: ${() => themeCssVariables.background.tertiary};
  }
`;

type RecordingVideoPlayerProps = {
  src: string;
  seekToSeconds: number;
  seekToken: number;
  onTimeUpdate: (currentTimeSeconds: number) => void;
  onRetry: () => void;
};

export const RecordingVideoPlayer = ({
  src,
  seekToSeconds,
  seekToken,
  onTimeUpdate,
  onRetry,
}: RecordingVideoPlayerProps) => {
  const [loadState, setLoadState] = useState<RecordingVideoLoadState>(
    'awaiting-first-frame',
  );
  const [isPlaybackStalled, setIsPlaybackStalled] = useState(false);

  const markFirstFrameReady = () => {
    setLoadState((previousLoadState) =>
      previousLoadState === 'awaiting-first-frame'
        ? 'ready'
        : previousLoadState,
    );
    setIsPlaybackStalled(false);
  };

  const handleTimeUpdate = (event: SyntheticEvent<HTMLVideoElement>) => {
    markFirstFrameReady();
    onTimeUpdate(event.currentTarget.currentTime);
  };

  const handleWaiting = () => setIsPlaybackStalled(true);

  const handlePause = () => setIsPlaybackStalled(false);

  const handleError = () => setLoadState('errored');

  if (loadState === 'errored') {
    return (
      <StyledVideoViewport>
        <StyledPlaybackErrorState>
          <StyledPlaybackErrorTitle>Playback failed</StyledPlaybackErrorTitle>
          <StyledPlaybackErrorDescription>
            The recording could not be loaded.
          </StyledPlaybackErrorDescription>
          <StyledRetryButton onClick={onRetry}>Retry</StyledRetryButton>
        </StyledPlaybackErrorState>
      </StyledVideoViewport>
    );
  }

  // The remote bridge has no imperative handle on the host video element, so
  // seeking swaps the media-fragment src and remounts: the browser reopens
  // the file at the requested time and autoplay resumes playback from there.
  const videoSrc =
    seekToken > 0
      ? `${src}#t=${Math.max(seekToSeconds, 0.001)}`
      : `${src}${FIRST_FRAME_SEEK_FRAGMENT}`;

  return (
    <StyledVideoViewport>
      <StyledVideo
        key={seekToken}
        $isFirstFrameReady={loadState === 'ready'}
        autoPlay={seekToken > 0}
        controls
        playsInline
        preload="metadata"
        src={videoSrc}
        onCanPlay={markFirstFrameReady}
        onError={handleError}
        onLoadedData={markFirstFrameReady}
        onPause={handlePause}
        onSeeked={markFirstFrameReady}
        onTimeUpdate={handleTimeUpdate}
        onWaiting={handleWaiting}
      />
      <StyledBufferingOverlay
        $isVisible={loadState === 'awaiting-first-frame' || isPlaybackStalled}
      >
        <CircularProgressBar barWidth={3} size={24} />
      </StyledBufferingOverlay>
    </StyledVideoViewport>
  );
};
