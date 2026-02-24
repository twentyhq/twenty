import { createComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createComponentFamilyState';
import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';

export const isRowSelectedComponentFamilyState = createComponentFamilyState<
  boolean,
  string
>({
  key: 'isRowSelectedComponentFamilyState',
  defaultValue: false,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
