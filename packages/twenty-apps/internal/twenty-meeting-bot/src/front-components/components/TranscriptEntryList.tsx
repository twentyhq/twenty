import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import { useMemo } from 'react';

import { TranscriptSpeakerChip } from 'src/front-components/components/TranscriptSpeakerChip';
import { recordingThemeCssVariables } from 'src/front-components/constants/recording-theme-css-variables';
import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import {
  type TranscriptEntry,
  type TranscriptWord,
} from 'src/front-components/types/transcript-entry.type';
import { findActiveTranscriptEntryIndex } from 'src/front-components/utils/find-active-transcript-entry-index.util';
import { formatTranscriptTimestamp } from 'src/front-components/utils/format-transcript-timestamp.util';
import { getSpeakerNameMatchKeys } from 'src/front-components/utils/get-speaker-name-match-keys.util';

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
  gap: ${recordingThemeCssVariables.spacing[2]};
  padding: ${recordingThemeCssVariables.spacing[2]};
`;

const StyledEntryHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${recordingThemeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledTimestamp = styled.span`
  color: ${recordingThemeCssVariables.font.colorTertiary};
  font-size: ${recordingThemeCssVariables.font.sizeXs};
`;

const StyledEntryText = styled.p`
  line-height: 1.4;
  margin: 0;
`;

const StyledWord = styled.span<{ $isSpoken: boolean }>`
  color: ${({ $isSpoken }) =>
    $isSpoken
      ? recordingThemeCssVariables.font.colorPrimary
      : recordingThemeCssVariables.font.colorTertiary};
  font-size: ${recordingThemeCssVariables.font.sizeSm};
  line-height: 1.4;
  transition: color 0.15s ease;
`;

type TranscriptEntryListProps = {
  entries: TranscriptEntry[];
  currentTimeSeconds: number;
  calendarEventParticipants: CalendarEventRecordingParticipant[];
};

export const TranscriptEntryList = ({
  entries,
  currentTimeSeconds,
  calendarEventParticipants,
}: TranscriptEntryListProps) => {
  const activeEntryIndex = findActiveTranscriptEntryIndex(
    entries,
    currentTimeSeconds,
  );
  const calendarEventParticipantBySpeakerName = useMemo(
    () =>
      buildCalendarEventParticipantBySpeakerName(calendarEventParticipants),
    [calendarEventParticipants],
  );

  return (
    <StyledTranscriptContainer>
      {entries.map((entry, entryIndex) => {
        const calendarEventParticipant =
          getCalendarEventParticipantForSpeakerName({
            speakerName: entry.speakerName,
            calendarEventParticipantBySpeakerName,
          });
        const speakerDisplayName =
          calendarEventParticipant?.displayName ?? entry.speakerName;

        return (
          <StyledEntry
            key={entryIndex}
            $isActive={entryIndex === activeEntryIndex}
          >
            <StyledEntryHeader>
              <TranscriptSpeakerChip
                speakerName={speakerDisplayName}
                avatarUrl={calendarEventParticipant?.avatarUrl}
                placeholderColorSeed={
                  calendarEventParticipant?.placeholderColorSeed ??
                  speakerDisplayName
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
      })}
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

const buildCalendarEventParticipantBySpeakerName = (
  calendarEventParticipants: CalendarEventRecordingParticipant[],
): Map<string, CalendarEventRecordingParticipant> => {
  const calendarEventParticipantBySpeakerName = new Map<
    string,
    CalendarEventRecordingParticipant
  >();
  const ambiguousSpeakerNameMatchKeys = new Set<string>();

  for (const calendarEventParticipant of calendarEventParticipants) {
    for (const nameCandidate of calendarEventParticipant.nameCandidates) {
      for (const speakerNameMatchKey of getSpeakerNameMatchKeys(
        nameCandidate,
      )) {
        const matchingCalendarEventParticipant =
          calendarEventParticipantBySpeakerName.get(speakerNameMatchKey);

        if (ambiguousSpeakerNameMatchKeys.has(speakerNameMatchKey)) {
          continue;
        }

        if (isUndefined(matchingCalendarEventParticipant)) {
          calendarEventParticipantBySpeakerName.set(
            speakerNameMatchKey,
            calendarEventParticipant,
          );
          continue;
        }

        if (matchingCalendarEventParticipant.id !== calendarEventParticipant.id) {
          calendarEventParticipantBySpeakerName.delete(speakerNameMatchKey);
          ambiguousSpeakerNameMatchKeys.add(speakerNameMatchKey);
        }
      }
    }
  }

  return calendarEventParticipantBySpeakerName;
};

const getCalendarEventParticipantForSpeakerName = ({
  speakerName,
  calendarEventParticipantBySpeakerName,
}: {
  speakerName: string;
  calendarEventParticipantBySpeakerName: Map<
    string,
    CalendarEventRecordingParticipant
  >;
}): CalendarEventRecordingParticipant | undefined => {
  for (const speakerNameMatchKey of getSpeakerNameMatchKeys(speakerName)) {
    const calendarEventParticipant =
      calendarEventParticipantBySpeakerName.get(speakerNameMatchKey);

    if (!isUndefined(calendarEventParticipant)) {
      return calendarEventParticipant;
    }
  }

  return undefined;
};
