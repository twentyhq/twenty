import { v4 } from 'uuid';
import { z } from 'zod';

import { useGetRelationMetadata } from '@/object-metadata/hooks/useGetRelationMetadata';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateObjectRecordOptimisticResponse = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const getRelationMetadata = useGetRelationMetadata();

  const generateObjectRecordOptimisticResponse = <
    GeneratedObjectRecord extends ObjectRecord,
  >(
    input: Record<string, unknown>,
  ) => {
    const recordSchema = z.object(
      Object.fromEntries(
        objectMetadataItem.fields.map((fieldMetadataItem) => [
          fieldMetadataItem.name,
          z.unknown().default(generateEmptyFieldValue(fieldMetadataItem)),
        ]),
      ),
    );

    const inputWithRelationFields = objectMetadataItem.fields.reduce(
      (result, fieldMetadataItem) => {
        const relationIdFieldName = `${fieldMetadataItem.name}Id`;

        if (!(relationIdFieldName in input)) return result;

        const relationMetadata = getRelationMetadata({ fieldMetadataItem });

        if (!relationMetadata) return result;

        const relationRecordTypeName = capitalize(
          relationMetadata.relationObjectMetadataItem.nameSingular,
        );
        const relationRecordId = result[relationIdFieldName] as string | null;

        return {
          ...result,
          [fieldMetadataItem.name]: relationRecordId
            ? {
                __typename: relationRecordTypeName,
                id: relationRecordId,
              }
            : null,
        };
      },
      input,
    );

    return {
      __typename: capitalize(objectMetadataItem.nameSingular),
      ...recordSchema.parse({
        id: v4(),
        createdAt: new Date().toISOString(),
        ...inputWithRelationFields,
      }),
    } as GeneratedObjectRecord & { __typename: string };
  };

  return {
    generateObjectRecordOptimisticResponse,
  };
};
