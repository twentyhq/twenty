import styled from '@emotion/styled';
import { useMemo } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TranscriptEntryListItem } from 'src/front-components/components/TranscriptEntryListItem';
import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { buildCalendarEventParticipantBySpeakerName } from 'src/front-components/utils/build-calendar-event-participant-by-speaker-name.util';
import { findActiveTranscriptEntryIndex } from 'src/front-components/utils/find-active-transcript-entry-index.util';
import { getCalendarEventParticipantForSpeakerName } from 'src/front-components/utils/get-calendar-event-participant-for-speaker-name.util';

const StyledTranscriptContainer = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  min-height: 0;
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
    () => buildCalendarEventParticipantBySpeakerName(calendarEventParticipants),
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

        return (
          <TranscriptEntryListItem
            key={entryIndex}
            entry={entry}
            isActive={entryIndex === activeEntryIndex}
            currentTimeSeconds={currentTimeSeconds}
            calendarEventParticipant={calendarEventParticipant}
          />
        );
      })}
    </StyledTranscriptContainer>
  );
};
