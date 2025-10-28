import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const recordCalendarSelectedDateComponentState =
  createComponentState<Date>({
    key: 'recordCalendarSelectedDateComponentState',
    defaultValue: new Date(),
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
