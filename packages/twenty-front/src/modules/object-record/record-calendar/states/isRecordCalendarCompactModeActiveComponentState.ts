import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const isRecordCalendarCompactModeActiveComponentState =
  createComponentState<boolean>({
    key: 'isRecordCalendarCompactModeActiveComponentState',
    defaultValue: false,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
