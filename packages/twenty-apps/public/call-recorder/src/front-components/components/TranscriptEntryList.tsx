import styled from '@emotion/styled';
import { useMemo } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TranscriptEntryListItem } from 'src/front-components/components/TranscriptEntryListItem';
import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { buildCalendarEventParticipantBySpeakerName } from 'src/front-components/utils/build-calendar-event-participant-by-speaker-name.util';
import { findActiveTranscriptEntryIndex } from 'src/front-components/utils/find-active-transcript-entry-index.util';
import { getCalendarEventParticipantForSpeakerName } from 'src/front-components/utils/get-calendar-event-participant-for-speaker-name.util';

// The transcript is the only scroll region of the recording tab: the video
// above it stays in view while entries scroll underneath.
const StyledTranscriptContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
`;

type TranscriptEntryListProps = {
  entries: TranscriptEntry[];
  currentTimeSeconds: number;
  calendarEventParticipants: CalendarEventRecordingParticipant[];
  isAutoFollowEnabled: boolean;
  onSeek: (startSeconds: number) => void;
  onUserScrollIntent: () => void;
};

export const TranscriptEntryList = ({
  entries,
  currentTimeSeconds,
  calendarEventParticipants,
  isAutoFollowEnabled,
  onSeek,
  onUserScrollIntent,
}: TranscriptEntryListProps) => {
  const activeEntryIndex = findActiveTranscriptEntryIndex(
    entries,
    currentTimeSeconds,
  );
  const calendarEventParticipantBySpeakerName = useMemo(
    () => buildCalendarEventParticipantBySpeakerName(calendarEventParticipants),
    [calendarEventParticipants],
  );

  // Wheel and touch are the user's scroll gestures; the host's own follow
  // scrolling only emits scroll events, so these two never misfire on it.
  const userScrollIntentHandler = isAutoFollowEnabled
    ? onUserScrollIntent
    : undefined;

  return (
    <StyledTranscriptContainer
      onWheel={userScrollIntentHandler}
      onTouchMove={userScrollIntentHandler}
    >
      {entries.map((entry, entryIndex) => {
        const calendarEventParticipant =
          getCalendarEventParticipantForSpeakerName({
            speakerName: entry.speakerName,
            calendarEventParticipantBySpeakerName,
          });

        return (
          <TranscriptEntryListItem
            key={entryIndex}
            entry={entry}
            entryIndex={entryIndex}
            isActive={entryIndex === activeEntryIndex}
            isFollowTarget={
              isAutoFollowEnabled && entryIndex === activeEntryIndex
            }
            currentTimeSeconds={currentTimeSeconds}
            calendarEventParticipant={calendarEventParticipant}
            onSeek={onSeek}
          />
        );
      })}
    </StyledTranscriptContainer>
  );
};
