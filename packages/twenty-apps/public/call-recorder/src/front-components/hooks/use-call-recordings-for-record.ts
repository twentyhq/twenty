import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';

import { CALL_RECORDINGS_WIDGET_MAX_COUNT } from 'src/front-components/constants/call-recordings-widget-max-count.constant';
import { type CalendarEventTargetFieldName } from 'src/front-components/types/calendar-event-target-field-name.type';
import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { fetchCallRecordingsForRecord } from 'src/front-components/utils/fetch-call-recordings-for-record.util';

type CallRecordingsForRecordState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; callRecordings: CallRecordingNode[] };

export const useCallRecordingsForRecord = ({
  calendarEventTargetFieldName,
  recordId,
}: {
  calendarEventTargetFieldName: CalendarEventTargetFieldName;
  recordId: string;
}): CallRecordingsForRecordState => {
  const [state, setState] = useState<CallRecordingsForRecordState>({
    status: 'loading',
  });

  useEffect(() => {
    let isCancelled = false;

    setState({ status: 'loading' });

    fetchCallRecordingsForRecord(new CoreApiClient(), {
      calendarEventTargetFieldName,
      recordId,
      maxCount: CALL_RECORDINGS_WIDGET_MAX_COUNT,
    })
      .then((callRecordings) => {
        if (!isCancelled) {
          setState({ status: 'loaded', callRecordings });
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setState({ status: 'error' });
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [calendarEventTargetFieldName, recordId]);

  return state;
};
