import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';

export const useGenerateEmptyRecord = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  // Todo fix typing once we generate the return base on Metadata
  const generateEmptyRecord = <T>(input: Partial<T> & { id: string }) => {
    // Todo replace this by runtime typing
    const validatedInput = input as { id: string } & { [key: string]: any };

    const emptyRecord = {} as Record<string, any>;

    for (const fieldMetadataItem of objectMetadataItem.fields) {
      emptyRecord[fieldMetadataItem.name] =
        validatedInput[fieldMetadataItem.name] ??
        generateEmptyFieldValue(fieldMetadataItem);
    }

    return emptyRecord;
  };

  return {
    generateEmptyRecord,
  };
};
