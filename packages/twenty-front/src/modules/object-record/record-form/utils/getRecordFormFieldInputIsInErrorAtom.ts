import { recordFieldInputIsFieldInErrorComponentState } from '@/object-record/record-field/ui/states/recordFieldInputIsFieldInErrorComponentState';
import { getRecordFormFieldInputInstanceId } from '@/object-record/record-form/utils/getRecordFormFieldInputInstanceId';

export const getRecordFormFieldInputIsInErrorAtom = ({
  formInstanceId,
  fieldMetadataId,
}: {
  formInstanceId: string;
  fieldMetadataId: string;
}) =>
  recordFieldInputIsFieldInErrorComponentState.atomFamily({
    instanceId: getRecordFormFieldInputInstanceId({
      formInstanceId,
      fieldMetadataId,
    }),
  });
