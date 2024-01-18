import { v4 } from 'uuid';
import { z } from 'zod';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateEmptyFieldValue } from '@/object-record/utils/generateEmptyFieldValue';
import { capitalize } from '~/utils/string/capitalize';

export const useGenerateCachedObjectRecord = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const generateCachedObjectRecord = <
    GeneratedObjectRecord extends ObjectRecord,
  >(
    input: Record<string, unknown>,
  ) => {
    const recordSchema = z.object(
      objectMetadataItem.fields.reduce<z.ZodRawShape>(
        (result, fieldMetadataItem) => ({
          ...result,
          [fieldMetadataItem.name]: z
            .unknown()
            .default(generateEmptyFieldValue(fieldMetadataItem)),
        }),
        { id: z.string().default(v4()) },
      ),
    );

    return {
      __typename: capitalize(objectMetadataItem.nameSingular),
      ...recordSchema.parse(input),
    } as GeneratedObjectRecord & { __typename: string };
  };

  return {
    generateCachedObjectRecord,
  };
};
