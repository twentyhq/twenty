import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';

export const hasInitializedCurrentRecordFiltersComponentFamilyState =
  createComponentFamilyStateV2<boolean, { viewId?: string }>({
    key: 'hasInitializedCurrentRecordFiltersComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFiltersComponentInstanceContext,
  });
