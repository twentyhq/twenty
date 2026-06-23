import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';

import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import {
  type TranscriptEntry,
  type TranscriptWord,
} from 'src/front-components/types/transcript-entry.type';
import { findActiveTranscriptEntryIndex } from 'src/front-components/utils/find-active-transcript-entry-index.util';
import { formatTranscriptTimestamp } from 'src/front-components/utils/format-transcript-timestamp.util';

const StyledTranscriptContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${recordingThemeCssVariables.spacing[2]};
  min-height: 0;
  overflow-y: auto;
`;

const StyledEntry = styled.div<{ $isActive: boolean }>`
  background: ${({ $isActive }) =>
    $isActive
      ? recordingThemeCssVariables.background.transparentBlue
      : 'transparent'};
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  display: flex;
  flex-direction: column;
  gap: ${recordingThemeCssVariables.spacing[1]};
  padding: ${recordingThemeCssVariables.spacing[1]};
`;

const StyledEntryHeader = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${recordingThemeCssVariables.spacing[2]};
`;

const StyledSpeakerName = styled.span`
  color: ${recordingThemeCssVariables.font.colorPrimary};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  font-weight: ${recordingThemeCssVariables.font.weightMedium};
`;

const StyledTimestamp = styled.span`
  color: ${recordingThemeCssVariables.font.colorTertiary};
  font-size: ${recordingThemeCssVariables.font.sizeXs};
`;

const StyledEntryText = styled.p`
  line-height: 1.5;
  margin: 0;
`;

const StyledWord = styled.span<{ $isSpoken: boolean }>`
  color: ${({ $isSpoken }) =>
    $isSpoken
      ? recordingThemeCssVariables.font.colorPrimary
      : recordingThemeCssVariables.font.colorTertiary};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  transition: color 0.15s ease;
`;

type TranscriptEntryListProps = {
  entries: TranscriptEntry[];
  currentTimeSeconds: number;
};

export const TranscriptEntryList = ({
  entries,
  currentTimeSeconds,
}: TranscriptEntryListProps) => {
  const activeEntryIndex = findActiveTranscriptEntryIndex(
    entries,
    currentTimeSeconds,
  );

  return (
    <StyledTranscriptContainer>
      {entries.map((entry, entryIndex) => (
        <StyledEntry
          key={entryIndex}
          $isActive={entryIndex === activeEntryIndex}
        >
          <StyledEntryHeader>
            <StyledSpeakerName>{entry.speakerName}</StyledSpeakerName>
            {!isUndefined(entry.startSeconds) && (
              <StyledTimestamp>
                {formatTranscriptTimestamp(entry.startSeconds)}
              </StyledTimestamp>
            )}
          </StyledEntryHeader>
          <StyledEntryText>
            {entry.words.map((word, wordIndex) => (
              <StyledWord
                key={wordIndex}
                $isSpoken={isWordSpoken({ word, currentTimeSeconds })}
              >
                {wordIndex > 0 ? ' ' : ''}
                {word.text}
              </StyledWord>
            ))}
          </StyledEntryText>
        </StyledEntry>
      ))}
    </StyledTranscriptContainer>
  );
};

const isWordSpoken = ({
  word,
  currentTimeSeconds,
}: {
  word: TranscriptWord;
  currentTimeSeconds: number;
}): boolean =>
  !isUndefined(word.startSeconds) && currentTimeSeconds >= word.startSeconds;
