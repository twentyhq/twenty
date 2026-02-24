import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createComponentFamilyState';

export const realIndexByVirtualIndexComponentFamilyState =
  createComponentFamilyState<number | null, { virtualIndex: number }>({
    key: 'realIndexByVirtualIndexComponentFamilyState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
