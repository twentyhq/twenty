import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { createComponentFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentFamilyStateV2';

export const hasInitializedCurrentRecordFieldsComponentFamilyState =
  createComponentFamilyStateV2<boolean, { viewId?: string }>({
    key: 'hasInitializedCurrentRecordFieldsComponentFamilyState',
    defaultValue: false,
    componentInstanceContext: RecordFieldsComponentInstanceContext,
  });
