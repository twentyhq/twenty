import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export const activeTableRowIndexComponentState = createComponentStateV2<
  number | null
>({
  key: 'activeTableRowIndexComponentState',
  defaultValue: null,
  componentInstanceContext: RecordTableComponentInstanceContext,
});
