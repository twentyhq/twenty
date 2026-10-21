import 'twenty-ui/style.css';

import { isUndefined } from '@sniptt/guards';
import {
  useLocale,
  useSelectedObjectMetadata,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

import { CallRecordingRow } from 'src/front-components/components/CallRecordingRow';
import { CallRecordingRowSkeleton } from 'src/front-components/components/CallRecordingRowSkeleton';
import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { StyledCallRecordingCard } from 'src/front-components/components/StyledCallRecordingCard';
import { useCallRecordingsForRecord } from 'src/front-components/hooks/use-call-recordings-for-record';
import { type CalendarEventTargetFieldName } from 'src/front-components/types/calendar-event-target-field-name.type';
import { getCallRecordingDisplayDate } from 'src/front-components/utils/get-call-recording-display-date.util';
import { formatCallRecordingDate } from 'src/front-components/utils/format-call-recording-date.util';
import { formatCallRecordingDuration } from 'src/front-components/utils/format-call-recording-duration.util';
import { getCallRecordingStatusTag } from 'src/front-components/utils/get-call-recording-status-tag.util';
import { getCalendarEventTargetFieldName } from 'src/front-components/utils/get-calendar-event-target-field-name.util';
import { resolveCallRecordingDisplayTitle } from 'src/front-components/utils/resolve-call-recording-display-title.util';

type CallRecordingListProps = {
  calendarEventTargetFieldName: CalendarEventTargetFieldName;
  recordId: string;
};

const CallRecordingList = ({
  calendarEventTargetFieldName,
  recordId,
}: CallRecordingListProps) => {
  const locale = useLocale();
  const callRecordingsState = useCallRecordingsForRecord({
    calendarEventTargetFieldName,
    recordId,
  });

  if (callRecordingsState.status === 'loading') {
    return <CallRecordingRowSkeleton />;
  }

  if (
    callRecordingsState.status === 'error' ||
    callRecordingsState.callRecordings.length === 0
  ) {
    return null;
  }

  return (
    <StyledCallRecordingCard>
      {callRecordingsState.callRecordings.map((callRecording) => (
        <CallRecordingRow
          key={callRecording.id}
          callRecordingId={callRecording.id}
          calendarEventId={
            callRecording.calendarEvent?.isShared
              ? callRecording.calendarEvent.id
              : undefined
          }
          title={resolveCallRecordingDisplayTitle(callRecording)}
          formattedDate={formatCallRecordingDate({
            dateTime: getCallRecordingDisplayDate(callRecording),
            locale,
          })}
          formattedDuration={formatCallRecordingDuration({
            startedAt: callRecording.startedAt,
            endedAt: callRecording.endedAt,
          })}
          statusTag={getCallRecordingStatusTag(callRecording.status)}
        />
      ))}
    </StyledCallRecordingCard>
  );
};

export const CallRecordingsWidget = () => {
  const selectedRecordIds = useSelectedRecordIds();
  const selectedObjectMetadata = useSelectedObjectMetadata();

  const recordId =
    selectedRecordIds.length === 1 ? selectedRecordIds[0] : undefined;
  const calendarEventTargetFieldName = getCalendarEventTargetFieldName(
    selectedObjectMetadata?.nameSingular,
  );

  const renderContent = () => {
    if (isUndefined(calendarEventTargetFieldName) || isUndefined(recordId)) {
      return null;
    }

    return (
      <CallRecordingList
        calendarEventTargetFieldName={calendarEventTargetFieldName}
        recordId={recordId}
      />
    );
  };

  return (
    <FrontComponentThemeProvider>{renderContent()}</FrontComponentThemeProvider>
  );
};
