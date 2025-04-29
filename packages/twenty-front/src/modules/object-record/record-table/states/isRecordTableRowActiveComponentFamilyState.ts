import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export const isRecordTableRowActiveComponentFamilyState =
  createComponentFamilyStateV2<boolean, string>({
    key: 'isRecordTableRowActiveComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
