import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const recordCalendarCardEditModePositionComponentState =
  createComponentState<number | null>({
    key: 'recordCalendarCardEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordCalendarCardComponentInstanceContext,
  });
