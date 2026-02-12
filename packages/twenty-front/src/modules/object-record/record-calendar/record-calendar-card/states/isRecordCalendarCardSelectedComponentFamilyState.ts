import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';
import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';

export const isRecordCalendarCardSelectedComponentFamilyState =
  createComponentFamilyState<boolean, string>({
    key: 'isRecordCalendarCardSelectedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordCalendarComponentInstanceContext,
  });
