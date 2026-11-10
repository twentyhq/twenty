import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useRef, useState } from 'react';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconPlayerPause, IconPlayerPlay } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { formatCallRecordingTranscriptTimestamp } from '@/page-layout/widgets/call-recording-transcript/utils/formatCallRecordingTranscriptTimestamp';
import { AudioBars } from '@/ui/feedback/audio-bars/components/AudioBars';
import { AUDIO_BAR_COUNT } from '@/ui/feedback/audio-bars/constants/AudioBarCount';

const StyledVoiceNote = styled.div`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.lgRound};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-variant-numeric: tabular-nums;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]}
    ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]};
  width: fit-content;
`;

type ChatThreadMessageVoiceNoteProps = {
  src: string;
  label: string;
  onError: () => void;
};

export const ChatThreadMessageVoiceNote = ({
  src,
  label,
  onError,
}: ChatThreadMessageVoiceNoteProps) => {
  const { t } = useLingui();
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeSeconds, setCurrentTimeSeconds] = useState(0);
  const [durationSeconds, setDurationSeconds] = useState(0);

  const isDurationKnown =
    Number.isFinite(durationSeconds) && durationSeconds > 0;
  const hasStarted = currentTimeSeconds > 0;
  const activeBars =
    isDurationKnown && hasStarted
      ? Math.ceil((currentTimeSeconds / durationSeconds) * AUDIO_BAR_COUNT)
      : 0;

  const handleTogglePlayback = () => {
    const audioElement = audioElementRef.current;

    if (audioElement?.paused === true) {
      audioElement.play().catch((error: unknown) => {
        // Pausing or reloading can interrupt play without a media failure.
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }

        onError();
      });

      return;
    }

    audioElement?.pause();
  };

  const PlaybackIcon = isPlaying ? IconPlayerPause : IconPlayerPlay;

  return (
    <StyledVoiceNote>
      <audio
        ref={audioElementRef}
        src={src}
        aria-label={label}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={() => {
          setIsPlaying(false);
          setCurrentTimeSeconds(0);
        }}
        onTimeUpdate={(event) =>
          setCurrentTimeSeconds(event.currentTarget.currentTime)
        }
        onDurationChange={(event) =>
          setDurationSeconds(event.currentTarget.duration)
        }
        onEmptied={() => {
          setIsPlaying(false);
          setCurrentTimeSeconds(0);
        }}
        onError={onError}
      />
      <LightIconButton
        aria-label={isPlaying ? t`Pause` : t`Play`}
        onClick={handleTogglePlayback}
      >
        <PlaybackIcon />
      </LightIconButton>
      <AudioBars activeBars={activeBars} />
      {isDurationKnown &&
        formatCallRecordingTranscriptTimestamp(
          hasStarted ? currentTimeSeconds : durationSeconds,
        )}
    </StyledVoiceNote>
  );
};
