import { isUndefined } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { CoreApiClient } from 'twenty-client-sdk/core';
import { enqueueSnackbar, useTranslate } from 'twenty-sdk/front-component';

import { CALL_RECORDINGS_WIDGET_MAX_COUNT } from 'src/front-components/constants/call-recordings-widget-max-count.constant';
import { CALL_RECORDINGS_WIDGET_REFRESH_INTERVAL_MILLISECONDS } from 'src/front-components/constants/call-recordings-widget-refresh-interval-milliseconds.constant';
import { type CalendarEventTargetFieldName } from 'src/front-components/types/calendar-event-target-field-name.type';
import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { fetchCallRecordingsForRecord } from 'src/front-components/utils/fetch-call-recordings-for-record.util';
import { isCallRecordingInProgress } from 'src/front-components/utils/is-call-recording-in-progress.util';

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
  const { t } = useTranslate();
  const [state, setState] = useState<CallRecordingsForRecordState>({
    status: 'loading',
  });

  useEffect(() => {
    let isCancelled = false;
    let hasLoaded = false;
    let refreshTimeout: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = () => {
      refreshTimeout = setTimeout(
        loadCallRecordings,
        CALL_RECORDINGS_WIDGET_REFRESH_INTERVAL_MILLISECONDS,
      );
    };

    const loadCallRecordings = () => {
      fetchCallRecordingsForRecord({
        client: new CoreApiClient(),
        calendarEventTargetFieldName,
        recordId,
        maxCount: CALL_RECORDINGS_WIDGET_MAX_COUNT,
      })
        .then((callRecordings) => {
          if (isCancelled) {
            return;
          }

          hasLoaded = true;
          setState({ status: 'loaded', callRecordings });

          if (callRecordings.some(isCallRecordingInProgress)) {
            scheduleRefresh();
          }
        })
        .catch(() => {
          if (isCancelled) {
            return;
          }

          if (hasLoaded) {
            scheduleRefresh();
          } else {
            setState({ status: 'error' });
            enqueueSnackbar({
              message: t('Could not load call recordings.'),
              variant: 'error',
            });
          }
        });
    };

    setState({ status: 'loading' });
    loadCallRecordings();

    return () => {
      isCancelled = true;

      if (!isUndefined(refreshTimeout)) {
        clearTimeout(refreshTimeout);
      }
    };
  }, [calendarEventTargetFieldName, recordId, t]);

  return state;
};
