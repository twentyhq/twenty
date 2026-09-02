import { type CallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/types/CallRecordingWidgetTarget';
import { isDefined } from 'twenty-shared/utils';

export const getCallRecordingWidgetFilter = ({
  targetKind,
  targetRecordId,
}: {
  targetKind: CallRecordingWidgetTarget['targetKind'] | undefined;
  targetRecordId: string | undefined;
}) => {
  if (!isDefined(targetRecordId)) {
    return undefined;
  }

  return targetKind === 'calendarEvent'
    ? { calendarEventId: { eq: targetRecordId } }
    : { id: { eq: targetRecordId } };
};
