import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export const isRecordTableRowFocusedComponentFamilyState =
  createComponentFamilyStateV2<boolean, number>({
    key: 'isRecordTableRowFocusedComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
