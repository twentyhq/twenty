import { RecordFilterGroupsComponentInstanceContext } from '@/object-record/record-filter-group/states/context/RecordFilterGroupsComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const hasInitializedCurrentRecordFilterGroupsComponentFamilyState =
  createAtomComponentFamilyState<boolean, { viewId?: string }>({
    key: 'hasInitializedCurrentRecordFilterGroupsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFilterGroupsComponentInstanceContext,
  });
