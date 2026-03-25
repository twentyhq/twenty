import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const hasInitializedCurrentRecordSortsComponentFamilyState =
  createAtomComponentFamilyState<boolean, { viewId?: string }>({
    key: 'hasInitializedCurrentRecordSortsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordSortsComponentInstanceContext,
  });
