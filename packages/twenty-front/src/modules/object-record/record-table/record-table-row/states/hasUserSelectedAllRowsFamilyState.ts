import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export const hasUserSelectedAllRowsComponentState =
  createComponentState<boolean>({
    key: 'hasUserSelectedAllRowsFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
