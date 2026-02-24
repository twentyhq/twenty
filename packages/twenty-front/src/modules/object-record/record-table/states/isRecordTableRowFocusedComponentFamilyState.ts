import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createComponentFamilyState';

export const isRecordTableRowFocusedComponentFamilyState =
  createComponentFamilyState<boolean, number>({
    key: 'isRecordTableRowFocusedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
