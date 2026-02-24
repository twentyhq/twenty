import { RecordFiltersComponentInstanceContext } from '@/object-record/record-filter/states/context/RecordFiltersComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';

export const hasInitializedChartFiltersComponentState =
  createComponentState<boolean>({
    key: 'hasInitializedCurrentRecordFiltersComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFiltersComponentInstanceContext,
  });
