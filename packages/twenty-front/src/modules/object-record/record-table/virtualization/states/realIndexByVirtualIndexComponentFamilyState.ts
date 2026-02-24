import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';

export const realIndexByVirtualIndexComponentFamilyState =
  createComponentFamilyStateV2<number | null, { virtualIndex: number }>({
    key: 'realIndexByVirtualIndexComponentFamilyState',
    componentInstanceContext: RecordTableComponentInstanceContext,
    defaultValue: null,
  });
