import { isNonEmptyString } from '@sniptt/guards';

import { type CallRecordingNode } from 'src/front-components/types/call-recording-node.type';
import { openRecord } from 'src/front-components/utils/open-record.util';

export const openCallRecordingCalendarEvent = (
  callRecording: Pick<CallRecordingNode, 'id' | 'calendarEventId'>,
): Promise<void> =>
  isNonEmptyString(callRecording.calendarEventId)
    ? openRecord({
        objectNameSingular: 'calendarEvent',
        recordId: callRecording.calendarEventId,
      })
    : openRecord({
        objectNameSingular: 'callRecording',
        recordId: callRecording.id,
      });
