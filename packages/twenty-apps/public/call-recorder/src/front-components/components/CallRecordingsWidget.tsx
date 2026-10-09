import 'twenty-ui/style.css';

import styled from '@emotion/styled';
import { isUndefined } from '@sniptt/guards';
import {
  useLocale,
  useSelectedObjectMetadata,
  useSelectedRecordIds,
} from 'twenty-sdk/front-component';

import { CallRecordingRow } from 'src/front-components/components/CallRecordingRow';
import { FrontComponentThemeProvider } from 'src/front-components/components/FrontComponentThemeProvider';
import { StyledWidgetContainer } from 'src/front-components/components/StyledWidgetContainer';
import { WidgetMessage } from 'src/front-components/components/WidgetMessage';
import { useCallRecordingsForRecord } from 'src/front-components/hooks/use-call-recordings-for-record';
import { type CalendarEventTargetFieldName } from 'src/front-components/types/calendar-event-target-field-name.type';
import { getCallRecordingDisplayDate } from 'src/front-components/utils/get-call-recording-display-date.util';
import { formatCallRecordingDate } from 'src/front-components/utils/format-call-recording-date.util';
import { getCalendarEventTargetFieldName } from 'src/front-components/utils/get-calendar-event-target-field-name.util';
import { resolveCallRecordingDisplayTitle } from 'src/front-components/utils/resolve-call-recording-display-title.util';

const StyledRowList = styled.div`
  display: flex;
  flex-direction: column;
`;

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

  switch (callRecordingsState.status) {
    case 'loading':
      return <WidgetMessage message="Loading call recordings…" />;
    case 'error':
      return <WidgetMessage message="Could not load call recordings." />;
    case 'loaded':
      if (callRecordingsState.callRecordings.length === 0) {
        return <WidgetMessage message="No call recordings yet." />;
      }

      return (
        <StyledRowList>
          {callRecordingsState.callRecordings.map((callRecording) => (
            <CallRecordingRow
              key={callRecording.id}
              callRecordingId={callRecording.id}
              title={resolveCallRecordingDisplayTitle(callRecording)}
              formattedDate={formatCallRecordingDate({
                dateTime: getCallRecordingDisplayDate(callRecording),
                locale,
              })}
            />
          ))}
        </StyledRowList>
      );
  }
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
    if (isUndefined(calendarEventTargetFieldName)) {
      return <WidgetMessage message="Not available on this page." />;
    }

    if (isUndefined(recordId)) {
      return <WidgetMessage message="No record selected." />;
    }

    return (
      <CallRecordingList
        calendarEventTargetFieldName={calendarEventTargetFieldName}
        recordId={recordId}
      />
    );
  };

  return (
    <FrontComponentThemeProvider>
      <StyledWidgetContainer>{renderContent()}</StyledWidgetContainer>
    </FrontComponentThemeProvider>
  );
};
