import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { TableCellPosition } from '../types/TableCellPosition';

export const isFocusOnTableCellComponentFamilyState =
  createComponentFamilyStateV2<boolean, TableCellPosition>({
    key: 'isFocusOnTableCellComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
