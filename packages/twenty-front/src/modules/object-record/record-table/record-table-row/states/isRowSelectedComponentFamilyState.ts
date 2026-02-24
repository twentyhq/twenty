import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';

export const isRowSelectedComponentFamilyState = createComponentFamilyStateV2<
  boolean,
  string
>({
  key: 'isRowSelectedComponentFamilyState',
  defaultValue: false,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
