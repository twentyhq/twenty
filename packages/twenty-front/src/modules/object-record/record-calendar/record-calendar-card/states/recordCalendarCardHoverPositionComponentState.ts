import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordCalendarCardHoverPositionComponentState =
  createComponentState<number | null>({
    key: 'recordCalendarCardHoverPositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordCalendarCardComponentInstanceContext,
  });
