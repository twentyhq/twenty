import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { TableCellPosition } from '../types/TableCellPosition';

export const isSoftFocusOnTableCellComponentFamilyState =
  createComponentFamilyStateV2<boolean, TableCellPosition>({
    key: 'isSoftFocusOnTableCellComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
