import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';

export const isRowSelectedComponentFamilyState = createAtomComponentFamilyState<
  boolean,
  string
>({
  key: 'isRowSelectedComponentFamilyState',
  defaultValue: false,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
