import styled from '@emotion/styled';
import { useMemo } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { TranscriptEntryListItem } from 'src/front-components/components/TranscriptEntryListItem';
import { type CalendarEventRecordingParticipant } from 'src/front-components/types/calendar-event-recording-participant.type';
import { type TranscriptEntry } from 'src/front-components/types/transcript-entry.type';
import { buildCalendarEventParticipantBySpeakerName } from 'src/front-components/utils/build-calendar-event-participant-by-speaker-name.util';
import { findActiveTranscriptEntryIndex } from 'src/front-components/utils/find-active-transcript-entry-index.util';
import { getCalendarEventParticipantForSpeakerName } from 'src/front-components/utils/get-calendar-event-participant-for-speaker-name.util';

// The transcript scrolls internally instead of growing with its entries. The
// widget is content-sized by the host, so the cap uses viewport units: with a
// video above (itself capped at 45vh) the transcript gets less room, without
// one it can take most of the viewport.
const StyledTranscriptContainer = styled.div<{ $hasVideo: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${() => themeCssVariables.spacing[2]};
  max-height: ${({ $hasVideo }) => ($hasVideo ? '40vh' : '65vh')};
  overflow-y: auto;
  overscroll-behavior: contain;
`;

type TranscriptEntryListProps = {
  entries: TranscriptEntry[];
  currentTimeSeconds: number;
  calendarEventParticipants: CalendarEventRecordingParticipant[];
  hasVideo: boolean;
  onSeek: (startSeconds: number) => void;
};

export const TranscriptEntryList = ({
  entries,
  currentTimeSeconds,
  calendarEventParticipants,
  hasVideo,
  onSeek,
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
    <StyledTranscriptContainer $hasVideo={hasVideo}>
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
            onSeek={onSeek}
          />
        );
      })}
    </StyledTranscriptContainer>
  );
};
