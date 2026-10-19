import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { type RowSlotBinding } from '@/object-record/record-table/virtualization/types/RowSlotBinding';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const rowSlotBindingComponentFamilyState =
  createAtomComponentFamilyState<RowSlotBinding | null, number>({
    key: 'rowSlotBindingComponentFamilyState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
