import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createComponentFamilyState';

export const hasInitializedCurrentRecordFiltersComponentFamilyState =
  createComponentFamilyState<boolean, { viewId?: string }>({
    key: 'hasInitializedCurrentRecordFiltersComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFiltersComponentInstanceContext,
  });
