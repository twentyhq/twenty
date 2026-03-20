import styled from '@emotion/styled';
import { useCallback, useEffect, useRef, useState } from 'react';

import { IconPlayerPause, IconPlayerPlay } from 'twenty-ui/display';
import { WHATSAPP_BRIDGE_URL } from '@/whatsapp-chat/constants/WhatsAppBridgeUrl';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  min-width: 200px;
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledPlayButton = styled.button<{ fromAgent?: boolean }>`
  align-items: center;
  background: ${({ fromAgent }) =>
    fromAgent ? 'rgba(255, 255, 255, 0.2)' : 'rgba(128, 128, 128, 0.15)'};
  border: none;
  border-radius: 50%;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  height: 32px;
  justify-content: center;
  width: 32px;

  &:hover {
    background: ${({ fromAgent }) =>
      fromAgent ? 'rgba(255, 255, 255, 0.35)' : 'rgba(128, 128, 128, 0.25)'};
  }
`;

const StyledWaveform = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 4px;
`;

const StyledProgressBar = styled.div<{ fromAgent?: boolean }>`
  background: ${({ fromAgent }) =>
    fromAgent ? 'rgba(255, 255, 255, 0.25)' : 'rgba(128, 128, 128, 0.2)'};
  border-radius: 2px;
  cursor: pointer;
  height: 4px;
  overflow: hidden;
  position: relative;
  width: 100%;
`;

const StyledProgress = styled.div<{ width: number; fromAgent?: boolean }>`
  background: currentColor;
  border-radius: 2px;
  height: 100%;
  opacity: ${({ fromAgent }) => (fromAgent ? 0.9 : 0.6)};
  transition: width 100ms linear;
  width: ${({ width }) => width}%;
`;

const StyledDuration = styled.span`
  color: inherit;
  font-size: 12px;
  opacity: 0.7;
`;

const StyledSpeedButton = styled.button<{ fromAgent?: boolean }>`
  background: ${({ fromAgent }) =>
    fromAgent ? 'rgba(255, 255, 255, 0.2)' : 'rgba(128, 128, 128, 0.15)'};
  border: none;
  border-radius: 10px;
  color: inherit;
  cursor: pointer;
  flex-shrink: 0;
  font-family: inherit;
  font-size: 11px;
  font-weight: 600;
  line-height: 1;
  padding: 3px 6px;

  &:hover {
    background: ${({ fromAgent }) =>
      fromAgent ? 'rgba(255, 255, 255, 0.35)' : 'rgba(128, 128, 128, 0.25)'};
  }
`;

const SPEED_OPTIONS = [1, 1.5, 2] as const;

const resolveMediaUrl = (mediaUrl: string): string => {
  // Rewrite WAHA internal URLs to go through the bridge media proxy
  const wahaMatch = mediaUrl.match(
    /^https?:\/\/[^/]+\/api\/files\/(.+)$/,
  );
  if (wahaMatch) {
    return `${WHATSAPP_BRIDGE_URL}/media/${wahaMatch[1]}`;
  }

  if (mediaUrl.startsWith('http://') || mediaUrl.startsWith('https://')) {
    return mediaUrl;
  }

  if (mediaUrl.startsWith('/')) {
    return `${WHATSAPP_BRIDGE_URL}${mediaUrl}`;
  }

  return `${WHATSAPP_BRIDGE_URL}/media/${mediaUrl}`;
};

const formatDuration = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds) || seconds < 0) {
    return '0:00';
  }

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const StyledTranscription = styled.div<{ fromAgent?: boolean }>`
  border-top: 1px solid
    ${({ fromAgent }) =>
      fromAgent ? 'rgba(255, 255, 255, 0.15)' : 'rgba(128, 128, 128, 0.15)'};
  font-size: 13px;
  line-height: 1.4;
  margin-top: ${({ theme }) => theme.spacing(1)};
  opacity: 0.85;
  padding-top: ${({ theme }) => theme.spacing(1)};
  white-space: pre-wrap;
  word-break: break-word;
`;

type VoiceMessageProps = {
  mediaUrl: string;
  fromAgent?: boolean;
  transcription?: string | null;
};

export const VoiceMessage = ({ mediaUrl, fromAgent, transcription }: VoiceMessageProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(0);

  const resolvedUrl = resolveMediaUrl(mediaUrl);

  useEffect(() => {
    const audio = new Audio(resolvedUrl);
    audioRef.current = audio;

    audio.addEventListener('loadedmetadata', () => {
      setDuration(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      setCurrentTime(audio.currentTime);

      if (audio.duration > 0) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    });

    audio.addEventListener('ended', () => {
      setIsPlaying(false);
      setProgress(0);
      setCurrentTime(0);
    });

    return () => {
      audio.pause();
      audio.src = '';
    };
  }, [resolvedUrl]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;

    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }

    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const handleProgressClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const audio = audioRef.current;

      if (!audio || !duration) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const ratio = (e.clientX - rect.left) / rect.width;

      audio.currentTime = ratio * duration;
    },
    [duration],
  );

  const handleCycleSpeed = useCallback(() => {
    const nextIndex = (speedIndex + 1) % SPEED_OPTIONS.length;
    setSpeedIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEED_OPTIONS[nextIndex];
    }
  }, [speedIndex]);

  const displayTime = isPlaying || currentTime > 0 ? currentTime : duration;

  return (
    <div>
      <StyledContainer>
        <StyledPlayButton fromAgent={fromAgent} onClick={togglePlay}>
          {isPlaying ? (
            <IconPlayerPause size={16} />
          ) : (
            <IconPlayerPlay size={16} />
          )}
        </StyledPlayButton>
        <StyledWaveform>
          <StyledProgressBar fromAgent={fromAgent} onClick={handleProgressClick}>
            <StyledProgress width={progress} fromAgent={fromAgent} />
          </StyledProgressBar>
          <StyledDuration>
            {displayTime > 0 ? formatDuration(displayTime) : '0:00'}
          </StyledDuration>
        </StyledWaveform>
        <StyledSpeedButton fromAgent={fromAgent} onClick={handleCycleSpeed}>
          {SPEED_OPTIONS[speedIndex]}x
        </StyledSpeedButton>
      </StyledContainer>
      {transcription && (
        <StyledTranscription fromAgent={fromAgent}>
          {transcription}
        </StyledTranscription>
      )}
    </div>
  );
};
