import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordCalendarCardHoverPositionComponentState =
  createComponentStateV2<number | null>({
    key: 'recordCalendarCardHoverPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordCalendarCardComponentInstanceContext,
  });
