import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { Sort } from '../../object-sort-dropdown/types/Sort';

export const tableSortsComponentState = createComponentStateV2<Sort[]>({
  key: 'tableSortsComponentState',
  defaultValue: [],
  componentInstanceContext: RecordTableComponentInstanceContext,
});
