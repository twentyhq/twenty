import { formatCallRecordingTranscriptTimestamp } from '@/page-layout/widgets/call-recording-transcript/utils/formatCallRecordingTranscriptTimestamp';
import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { useImperativeHandle, useRef, useState, type Ref } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { CircularProgressBar } from 'twenty-ui/feedback';
import {
  IconHeadphones,
  IconPlayerPause,
  IconPlayerPlay,
} from 'twenty-ui/icon';
import { Button, IconButton, Slider } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAudioBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[10]};
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledTrack = styled.div`
  flex: 1;
  min-width: 0;
`;

const StyledLoadingTrack = styled.div`
  background: ${themeCssVariables.background.tertiary};
  border-radius: ${themeCssVariables.border.radius.pill};
  height: ${themeCssVariables.spacing[4]};
`;

const StyledTime = styled.span`
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.xs};
  font-variant-numeric: tabular-nums;
`;

type CallRecordingAudioPlayerProps = {
  ref?: Ref<HTMLAudioElement>;
  src: string;
  onRetry: () => Promise<void>;
};

export const CallRecordingAudioPlayer = ({
  ref,
  src,
  onRetry,
}: CallRecordingAudioPlayerProps) => {
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [isStalled, setIsStalled] = useState(false);
  const [isErrored, setIsErrored] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  useImperativeHandle<HTMLAudioElement | null, HTMLAudioElement | null>(
    ref,
    () => audioElementRef.current,
    [],
  );

  const isDurationKnown =
    Number.isFinite(durationSeconds) && durationSeconds > 0;
  const elapsedTime = isDurationKnown
    ? formatCallRecordingTranscriptTimestamp(currentTimeSeconds)
    : '--:--';
  const totalTime = isDurationKnown
    ? formatCallRecordingTranscriptTimestamp(durationSeconds)
    : '--:--';
  const minutes = Math.floor(currentTimeSeconds / 60);
  const seconds = Math.floor(currentTimeSeconds % 60);
  const spokenMinutes = plural(minutes, {
    one: '# minute',
    other: '# minutes',
  });
  const spokenSeconds = plural(seconds, {
    one: '# second',
    other: '# seconds',
  });

  const handleTogglePlayback = async () => {
    const audioElement = audioElementRef.current;

    if (!isDefined(audioElement)) {
      return;
    }

    if (!audioElement.paused) {
      audioElement.pause();
      return;
    }

    try {
      await audioElement.play();
    } catch (error) {
      // Pausing or reloading can interrupt play without a media failure.
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      setIsErrored(true);
      setIsStalled(false);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    setIsStalled(false);
  };

  const handleCommitSeek = (value: number) => {
    if (isDefined(audioElementRef.current) && isDurationKnown) {
      audioElementRef.current.currentTime = value;
      setCurrentTimeSeconds(value);
    }
    setIsSeeking(false);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setIsStalled(false);

    try {
      await onRetry();
      setIsErrored(false);
      setCurrentTimeSeconds(0);
      setDurationSeconds(0);
      setIsSeeking(false);
      audioElementRef.current?.load();
    } catch {
      // A failed refetch surfaces through the widget's query error state.
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <StyledAudioBar>
      <audio
        ref={audioElementRef}
        src={src}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={handlePause}
        onEnded={handlePause}
        onTimeUpdate={(event) => {
          if (!isSeeking) {
            setCurrentTimeSeconds(event.currentTarget.currentTime);
          }
        }}
        onLoadedMetadata={(event) =>
          setDurationSeconds(event.currentTarget.duration)
        }
        onDurationChange={(event) =>
          setDurationSeconds(event.currentTarget.duration)
        }
        onWaiting={() => setIsStalled(true)}
        onPlaying={() => setIsStalled(false)}
        onCanPlay={() => setIsStalled(false)}
        onError={() => {
          setIsErrored(true);
          handlePause();
        }}
      />
      <IconHeadphones size={16} aria-hidden />
      {isErrored ? (
        <>
          <StyledTrack role="status">{t`Playback failed`}</StyledTrack>
          <Button
            title={t`Retry`}
            variant="secondary"
            size="small"
            disabled={isRetrying}
            isLoading={isRetrying}
            onClick={handleRetry}
          />
        </>
      ) : (
        <>
          <IconButton
            ariaLabel={isPlaying ? t`Pause` : t`Play`}
            Icon={
              isStalled
                ? undefined
                : isPlaying
                  ? IconPlayerPause
                  : IconPlayerPlay
            }
            size="small"
            variant="tertiary"
            onClick={handleTogglePlayback}
          >
            {isStalled && <CircularProgressBar barWidth={2} size={24} />}
          </IconButton>
          <StyledTrack>
            {isDurationKnown ? (
              <Slider.Root
                max={durationSeconds}
                step={0.1}
                value={currentTimeSeconds}
                onValueChange={(value, details) => {
                  setCurrentTimeSeconds(value);
                  setIsSeeking(
                    details.reason === 'track-press' ||
                      details.reason === 'drag',
                  );
                }}
                onValueCommitted={handleCommitSeek}
                onPointerCancel={() => {
                  setIsSeeking(false);
                  setCurrentTimeSeconds(
                    audioElementRef.current?.currentTime ?? 0,
                  );
                }}
              >
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Indicator />
                    <Slider.Thumb
                      aria-label={t`Seek`}
                      aria-valuetext={t`${spokenMinutes} ${spokenSeconds}`}
                      onBlur={(event) => {
                        if (isSeeking) {
                          handleCommitSeek(event.currentTarget.valueAsNumber);
                        }
                      }}
                    />
                  </Slider.Track>
                </Slider.Control>
              </Slider.Root>
            ) : (
              <StyledLoadingTrack />
            )}
          </StyledTrack>
          <StyledTime>
            {elapsedTime} / {totalTime}
          </StyledTime>
        </>
      )}
    </StyledAudioBar>
  );
};
