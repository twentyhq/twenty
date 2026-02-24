import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createComponentFamilyState';

export const hasInitializedAnyFieldFilterComponentFamilyState =
  createComponentFamilyState<boolean, { viewId?: string }>({
    key: 'hasInitializedAnyFieldFilterComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFiltersComponentInstanceContext,
  });
