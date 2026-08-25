import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useCalendarEventTargetRecordId = (): string | undefined => {
  const { targetRecordIdentifier } = useLayoutRenderingContext();

  return targetRecordIdentifier?.targetObjectNameSingular ===
    CoreObjectNameSingular.CalendarEvent
    ? targetRecordIdentifier.id
    : undefined;
};
