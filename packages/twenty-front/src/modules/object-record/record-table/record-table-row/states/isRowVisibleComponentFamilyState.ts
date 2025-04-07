import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export const isRowVisibleComponentFamilyState = createComponentFamilyStateV2<
  boolean,
  string
>({
  key: 'isRowVisibleComponentFamilyState',
  defaultValue: true,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
