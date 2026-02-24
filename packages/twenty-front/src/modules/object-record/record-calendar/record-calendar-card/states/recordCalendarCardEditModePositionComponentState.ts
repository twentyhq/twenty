import { RecordCalendarCardComponentInstanceContext } from '@/object-record/record-calendar/record-calendar-card/states/contexts/RecordCalendarCardComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export const recordCalendarCardEditModePositionComponentState =
  createComponentStateV2<number | null>({
    key: 'recordCalendarCardEditModePositionComponentState',
    defaultValue: null,
    componentInstanceContext: RecordCalendarCardComponentInstanceContext,
  });
