import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { Avatar, Chip, ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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
      ? themeCssVariables.background.transparent.blue
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['2']};
  justify-content: center;
  padding: ${themeCssVariables.spacing['2']};
  width: 100%;
`;

const StyledEntryHeader = styled.div`
  align-items: center;
  align-self: stretch;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
  min-height: ${themeCssVariables.spacing['6']};
  min-width: 0;
`;

const StyledTimestamp = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  line-height: 1.4;
`;

const StyledEntryText = styled.p`
  align-self: stretch;
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
  margin: 0;
`;

const StyledWord = styled.span<{ $isSpoken: boolean }>`
  color: ${({ $isSpoken }) =>
    $isSpoken
      ? themeCssVariables.font.color.primary
      : themeCssVariables.font.color.secondary};
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
        <Chip
          label={speakerDisplayName}
          variant={ChipVariant.Transparent}
          leftComponent={
            <Avatar
              avatarUrl={calendarEventParticipant?.avatarUrl}
              placeholder={speakerDisplayName}
              placeholderColorSeed={
                calendarEventParticipant?.placeholderColorSeed ??
                speakerDisplayName
              }
              size="xs"
              type="rounded"
            />
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
