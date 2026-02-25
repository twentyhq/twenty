import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { createAtomComponentFamilyState } from '@/ui/utilities/state/jotai/utils/createAtomComponentFamilyState';

export const hasInitializedCurrentRecordFieldsComponentFamilyState =
  createAtomComponentFamilyState<boolean, { viewId?: string }>({
    key: 'hasInitializedCurrentRecordFieldsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFieldsComponentInstanceContext,
  });
