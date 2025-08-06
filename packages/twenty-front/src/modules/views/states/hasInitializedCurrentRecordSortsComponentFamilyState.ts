import { RecordSortsComponentInstanceContext } from '@/object-record/record-sort/states/context/RecordSortsComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';

export const hasInitializedCurrentRecordSortsComponentFamilyState =
  createComponentFamilyState<boolean, { viewId?: string }>({
    key: 'hasInitializedCurrentRecordSortsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordSortsComponentInstanceContext,
  });
