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
      Object.fromEntries(
        objectMetadataItem.fields.map((fieldMetadataItem) => [
          fieldMetadataItem.name,
          z.unknown().default(generateEmptyFieldValue(fieldMetadataItem)),
        ]),
      ),
    );

    return {
      __typename: capitalize(objectMetadataItem.nameSingular),
      ...recordSchema.parse({
        id: v4(),
        createdAt: new Date().toISOString(),
        ...input,
      }),
    } as GeneratedObjectRecord & { __typename: string };
  };

  return {
    generateCachedObjectRecord,
  };
};
