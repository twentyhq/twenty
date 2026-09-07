import { CallRecordingTranscriptPlaybackEffect } from '@/page-layout/widgets/call-recording-transcript/components/CallRecordingTranscriptPlaybackEffect';
import { CALL_RECORDING_TRANSCRIPT_CURRENT_SPOKEN_WORD_DATA_ATTRIBUTE } from '@/page-layout/widgets/call-recording-transcript/constants/CallRecordingTranscriptCurrentSpokenWordDataAttribute';
import { INITIAL_CALL_RECORDING_TRANSCRIPT_PLAYBACK_POSITION } from '@/page-layout/widgets/call-recording-transcript/constants/InitialCallRecordingTranscriptPlaybackPosition';
import { styled } from '@linaria/react';
import { useState } from 'react';
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
  const [wordPlaybackPosition, setWordPlaybackPosition] = useState(
    INITIAL_CALL_RECORDING_TRANSCRIPT_PLAYBACK_POSITION,
  );

  return (
    <>
      <CallRecordingTranscriptPlaybackEffect
        videoElement={videoElement}
        timedItems={words}
        onPlaybackPositionChange={setWordPlaybackPosition}
      />
      {words.map((word, wordIndex) => (
        <StyledWord
          key={wordIndex}
          {...{
            [CALL_RECORDING_TRANSCRIPT_CURRENT_SPOKEN_WORD_DATA_ATTRIBUTE]:
              wordIndex === wordPlaybackPosition.activeIndex || undefined,
          }}
          isSpoken={wordIndex <= wordPlaybackPosition.lastStartedIndex}
        >
          {wordIndex > 0 ? ' ' : ''}
          {word.text}
        </StyledWord>
      ))}
    </>
  );
};
