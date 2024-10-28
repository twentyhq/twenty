import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { TableCellPosition } from '../types/TableCellPosition';

export const softFocusPositionComponentState =
  createComponentStateV2<TableCellPosition>({
    key: 'softFocusPositionComponentState',
    defaultValue: {
      row: 0,
      column: 1,
    },
    componentInstanceContext: RecordTableScopeInternalContext,
  });
