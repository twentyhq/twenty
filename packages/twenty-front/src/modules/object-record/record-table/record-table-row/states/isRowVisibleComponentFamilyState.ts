import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const isRowVisibleComponentFamilyState = createComponentFamilyState<
  boolean,
  string
>({
  key: 'isRowVisibleComponentFamilyState',
  defaultValue: true,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
