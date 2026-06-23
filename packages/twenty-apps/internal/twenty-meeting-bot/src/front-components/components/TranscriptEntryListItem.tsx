import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';

import { TranscriptSpeakerChip } from 'src/front-components/components/TranscriptSpeakerChip';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import {
  type TranscriptEntry,
  type TranscriptWord,
} from 'src/front-components/types/transcript-entry.type';
import { formatTranscriptTimestamp } from 'src/front-components/utils/format-transcript-timestamp.util';

const StyledEntry = styled.div<{ $isActive: boolean }>`
  align-items: flex-start;
  background: ${({ $isActive }) =>
    $isActive
      ? recordingThemeCssVariables.background.transparentBlue
      : 'transparent'};
  border-radius: ${recordingThemeCssVariables.border.radiusMd};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${recordingThemeCssVariables.spacing[2]};
  justify-content: center;
  padding: ${recordingThemeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledEntryHeader = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${recordingThemeCssVariables.spacing[2]};
  min-height: ${recordingThemeCssVariables.spacing[6]};
  min-width: 0;
`;

const StyledTimestamp = styled.span`
  color: ${recordingThemeCssVariables.font.colorTertiary};
  font-size: ${recordingThemeCssVariables.font.sizeXs};
  line-height: 1.4;
`;

const StyledEntryText = styled.p`
  align-self: stretch;
  color: ${recordingThemeCssVariables.font.colorSecondary};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  line-height: 1.4;
  margin: 0;
`;

const StyledWord = styled.span<{ $isSpoken: boolean }>`
  color: ${({ $isSpoken }) =>
    $isSpoken
      ? recordingThemeCssVariables.font.colorPrimary
      : recordingThemeCssVariables.font.colorSecondary};
  line-height: 1.4;
  transition: color 0.15s ease;
`;

type TranscriptEntryListItemProps = {
  entry: TranscriptEntry;
  isActive: boolean;
  currentTimeSeconds: number;
  calendarEventParticipant: CalendarEventRecordingParticipant | undefined;
};

export const TranscriptEntryListItem = ({
  entry,
  isActive,
  currentTimeSeconds,
  calendarEventParticipant,
}: TranscriptEntryListItemProps) => {
  const speakerDisplayName =
    calendarEventParticipant?.displayName ?? entry.speakerName;

  return (
    <StyledEntry $isActive={isActive}>
      <StyledEntryHeader>
        <TranscriptSpeakerChip
          speakerName={speakerDisplayName}
          avatarUrl={calendarEventParticipant?.avatarUrl}
          placeholderColorSeed={
            calendarEventParticipant?.placeholderColorSeed ?? speakerDisplayName
          }
        />
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
