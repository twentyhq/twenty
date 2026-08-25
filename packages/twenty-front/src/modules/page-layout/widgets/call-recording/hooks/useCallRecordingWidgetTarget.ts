import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { CoreObjectNameSingular } from 'twenty-shared/types';

// A call recording widget reaches its recording either through the calendar
// event that owns it, or directly when the target record is the recording.
export type CallRecordingWidgetTarget = {
  targetKind: 'calendarEvent' | 'callRecording';
  recordId: string;
};

export const useCallRecordingWidgetTarget = ():
  | CallRecordingWidgetTarget
  | undefined => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  switch (targetRecordIdentifier?.targetObjectNameSingular) {
    case CoreObjectNameSingular.CalendarEvent:
      return {
        targetKind: 'calendarEvent',
        recordId: targetRecordIdentifier.id,
      };
    case CoreObjectNameSingular.CallRecording:
      return {
        targetKind: 'callRecording',
        recordId: targetRecordIdentifier.id,
      };
    default:
      return undefined;
  }
};
