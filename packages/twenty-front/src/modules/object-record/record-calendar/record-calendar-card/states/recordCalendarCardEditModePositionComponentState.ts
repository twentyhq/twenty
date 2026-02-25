import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const recordCalendarCardEditModePositionComponentState =
  createAtomComponentState<number | null>({
    key: 'recordCalendarCardEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordCalendarCardComponentInstanceContext,
  });
