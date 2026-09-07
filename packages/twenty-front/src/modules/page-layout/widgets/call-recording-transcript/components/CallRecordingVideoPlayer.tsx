import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState, type Ref } from 'react';
import { CircularProgressBar } from 'twenty-ui/feedback';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

// Forces Safari to decode the first frame under preload="metadata".
const FIRST_FRAME_SEEK_FRAGMENT = '#t=0.001';

type CallRecordingVideoLoadState = 'awaiting-first-frame' | 'ready' | 'errored';

const StyledVideoViewport = styled.div`
  aspect-ratio: 16 / 9;
  background: ${themeCssVariables.background.primary};
  border-radius: ${themeCssVariables.border.radius.sm};
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledVideo = styled.video<{ isFirstFrameReady: boolean }>`
  accent-color: ${themeCssVariables.accent.accent9};
  background: ${themeCssVariables.background.primary};
  color-scheme: light dark;
  display: block;
  height: 100%;
  object-fit: contain;
  opacity: ${({ isFirstFrameReady }) => (isFirstFrameReady ? 1 : 0)};
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease;
  width: 100%;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const StyledBufferingOverlay = styled.div<{ isVisible: boolean }>`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  inset: 0;
  justify-content: center;
  opacity: ${({ isVisible }) => (isVisible ? 1 : 0)};
  pointer-events: none;
  position: absolute;
  transition: opacity calc(${themeCssVariables.animation.duration.fast} * 1s)
    ease;
  transition-delay: ${({ isVisible }) =>
    isVisible
      ? `calc(${themeCssVariables.animation.duration.normal} * 1s)`
      : '0s'};

  @media (prefers-reduced-motion: reduce) {
    transition-duration: 0ms;
  }
`;

const StyledPlaybackErrorState = styled.div`
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  height: 100%;
  justify-content: center;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledPlaybackErrorTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledPlaybackErrorDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type CallRecordingVideoPlayerProps = {
  ref?: Ref<HTMLVideoElement>;
  src: string;
  onRetry: () => Promise<unknown>;
};

export const CallRecordingVideoPlayer = ({
  ref,
  src,
  onRetry,
}: CallRecordingVideoPlayerProps) => {
  const [loadState, setLoadState] = useState<CallRecordingVideoLoadState>(
    'awaiting-first-frame',
  );
  const [isPlaybackStalled, setIsPlaybackStalled] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const markFirstFrameReady = () => {
    setLoadState((previousLoadState) =>
      previousLoadState === 'awaiting-first-frame'
        ? 'ready'
        : previousLoadState,
    );
    setIsPlaybackStalled(false);
  };

  const handleWaiting = () => setIsPlaybackStalled(true);

  const handlePause = () => setIsPlaybackStalled(false);

  const handleError = () => setLoadState('errored');

  const handleRetry = async () => {
    setIsRetrying(true);
    setIsPlaybackStalled(false);

    try {
      await onRetry();
      setLoadState('awaiting-first-frame');
    } catch {
      // A failed refetch surfaces through the widget's query error state.
    } finally {
      setIsRetrying(false);
    }
  };

  if (loadState === 'errored') {
    return (
      <StyledVideoViewport>
        <StyledPlaybackErrorState>
          <StyledPlaybackErrorTitle>{t`Playback failed`}</StyledPlaybackErrorTitle>
          <StyledPlaybackErrorDescription>
            {t`The recording could not be loaded.`}
          </StyledPlaybackErrorDescription>
          <Button
            title={t`Retry`}
            variant="secondary"
            disabled={isRetrying}
            isLoading={isRetrying}
            onClick={handleRetry}
          />
        </StyledPlaybackErrorState>
      </StyledVideoViewport>
    );
  }

  return (
    <StyledVideoViewport>
      <StyledVideo
        ref={ref}
        isFirstFrameReady={loadState === 'ready'}
        controls
        playsInline
        preload="metadata"
        src={`${src}${FIRST_FRAME_SEEK_FRAGMENT}`}
        onCanPlay={markFirstFrameReady}
        onError={handleError}
        onLoadedData={markFirstFrameReady}
        onPause={handlePause}
        onSeeking={markFirstFrameReady}
        onSeeked={markFirstFrameReady}
        onTimeUpdate={markFirstFrameReady}
        onWaiting={handleWaiting}
      />
      <StyledBufferingOverlay
        isVisible={loadState === 'awaiting-first-frame' || isPlaybackStalled}
      >
        <CircularProgressBar barWidth={3} size={24} />
      </StyledBufferingOverlay>
    </StyledVideoViewport>
  );
};
