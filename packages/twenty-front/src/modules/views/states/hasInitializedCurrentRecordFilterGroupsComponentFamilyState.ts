import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const hasInitializedCurrentRecordFilterGroupsComponentFamilyState =
  createComponentFamilyState<boolean, { viewId?: string }>({
    key: 'hasInitializedCurrentRecordFilterGroupsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFilterGroupsComponentInstanceContext,
  });
