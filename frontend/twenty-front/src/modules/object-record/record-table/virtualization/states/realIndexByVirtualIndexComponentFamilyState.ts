import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const realIndexByVirtualIndexComponentFamilyState =
  createAtomComponentFamilyState<number | null, { virtualIndex: number }>({
    key: 'realIndexByVirtualIndexComponentFamilyState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
