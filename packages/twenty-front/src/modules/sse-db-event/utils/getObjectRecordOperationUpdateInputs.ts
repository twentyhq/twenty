import { type ObjectRecordOperationUpdateInput } from '@/object-record/types/ObjectRecordOperationUpdateInput';
import { isDefined } from 'twenty-shared/utils';
import { type ObjectRecordEvent } from '~/generated-metadata/graphql';

export const getObjectRecordOperationUpdateInputs = (
  events: ObjectRecordEvent[],
): ObjectRecordOperationUpdateInput[] => {
  return events
    .map((event) => {
      const updatedFieldNames = event.properties?.updatedFields ?? [];
      const updatedRecord = event.properties?.after;

      if (!isDefined(updatedRecord)) {
        return null;
      }

      return {
        recordId: event.recordId,
        updatedFields: updatedFieldNames.map((fieldName) => ({
          [fieldName]: updatedRecord[fieldName],
        })),
      };
    })
    .filter(isDefined)
    .filter((updateInput) => updateInput.updatedFields.length > 0);
};
