import { RecordTableScopeInternalContext } from '@/object-record/record-table/scopes/scope-internal-context/RecordTableScopeInternalContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { TableCellPosition } from '../types/TableCellPosition';

export const isSoftFocusOnTableCellComponentFamilyState =
  createComponentFamilyStateV2<boolean, TableCellPosition>({
    key: 'isSoftFocusOnTableCellComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordTableScopeInternalContext,
  });
