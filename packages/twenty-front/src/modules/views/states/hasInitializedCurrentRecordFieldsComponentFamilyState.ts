import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { createComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createComponentFamilyState';

export const hasInitializedCurrentRecordFieldsComponentFamilyState =
  createComponentFamilyState<boolean, { viewId?: string }>({
    key: 'hasInitializedCurrentRecordFieldsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFieldsComponentInstanceContext,
  });
