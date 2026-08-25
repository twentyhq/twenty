import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { CoreObjectNameSingular } from 'twenty-shared/types';

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
