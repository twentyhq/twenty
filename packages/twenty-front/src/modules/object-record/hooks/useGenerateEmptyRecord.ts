import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';

export const useGenerateEmptyRecord = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  // Todo fix typing once we generate the return base on Metadata
  const generateEmptyRecord = <T extends ObjectRecord>(input: T) => {
    // Todo replace this by runtime typing
    const validatedInput = input as T;

    const emptyRecord = {} as any;

    for (const fieldMetadataItem of objectMetadataItem.fields) {
      emptyRecord[fieldMetadataItem.name] =
        validatedInput[fieldMetadataItem.name] ??
        generateEmptyFieldValue(fieldMetadataItem);
    }

    return emptyRecord as T;
  };

  return {
    generateEmptyRecord,
  };
};
