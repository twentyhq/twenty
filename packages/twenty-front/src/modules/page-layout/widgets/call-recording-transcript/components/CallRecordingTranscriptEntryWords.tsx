import { CallRecordingTranscriptPlaybackEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptPlaybackEffect';
import { buildCallRecordingTranscriptTimePoints } from '@/page-layout/widgets/call-recording-transcript/utils/buildCallRecordingTranscriptTimePoints';
import { styled } from '@linaria/react';
import { useMemo, useState } from 'react';
import { type CallRecordingParsedTranscriptWord } from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledWord = styled.span<{ isSpoken: boolean }>`
  color: ${({ isSpoken }) =>
    isSpoken
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
  transition: color calc(${themeCssVariables.animation.duration.fast} * 1s) ease;
`;

type CallRecordingTranscriptEntryWordsProps = {
  words: CallRecordingParsedTranscriptWord[];
  videoElement: HTMLVideoElement;
};

export const CallRecordingTranscriptEntryWords = ({
  words,
  videoElement,
}: CallRecordingTranscriptEntryWordsProps) => {
  const [wordPlaybackPosition, setWordPlaybackPosition] = useState({
    activeIndex: -1,
    lastStartedIndex: -1,
  });

  const wordTimePoints = useMemo(
    () => buildCallRecordingTranscriptTimePoints(words),
    [words],
  );

  return (
    <>
      <CallRecordingTranscriptPlaybackEffect
        videoElement={videoElement}
        timePoints={wordTimePoints}
        onPlaybackPositionChange={setWordPlaybackPosition}
      />
      {words.map((word, wordIndex) => (
        <StyledWord
          key={wordIndex}
          data-current-spoken-word={
            wordIndex === wordPlaybackPosition.activeIndex ? 'true' : undefined
          }
          isSpoken={wordIndex <= wordPlaybackPosition.lastStartedIndex}
        >
          {wordIndex > 0 ? ' ' : ''}
          {word.text}
        </StyledWord>
      ))}
    </>
  );
};
