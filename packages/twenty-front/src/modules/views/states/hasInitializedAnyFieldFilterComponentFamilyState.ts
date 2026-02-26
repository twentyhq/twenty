import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const hasInitializedAnyFieldFilterComponentFamilyState =
  createAtomComponentFamilyState<boolean, { viewId?: string }>({
    key: 'hasInitializedAnyFieldFilterComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFiltersComponentInstanceContext,
  });
