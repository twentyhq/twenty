import { type CallRecordingWidgetTarget } from '@/page-layout/widgets/call-recording/types/CallRecordingWidgetTarget';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { StandardObjectNameSingular } from 'twenty-shared/types';

export const useCallRecordingWidgetTarget = ():
  | CallRecordingWidgetTarget
  | undefined => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  switch (targetRecordIdentifier?.targetObjectNameSingular) {
    case StandardObjectNameSingular.CalendarEvent:
      return {
        targetKind: 'calendarEvent',
        recordId: targetRecordIdentifier.id,
      };
    case StandardObjectNameSingular.CallRecording:
      return {
        targetKind: 'callRecording',
        recordId: targetRecordIdentifier.id,
      };
    default:
      return undefined;
  }
};
