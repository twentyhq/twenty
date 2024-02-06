import { z } from 'zod';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFieldSchema } from '@/object-record/utils/generateFieldSchema';
import { capitalize } from '~/utils/string/capitalize';

type GenerateObjectRecordSchemaParams = {
  isPartial?: boolean;
  objectMetadataItem: ObjectMetadataItem;
  omitRelationFields?: boolean;
  objectMetadataItems: ObjectMetadataItem[];
};

export const generateObjectRecordSchema = <
  ValidatedObjectRecord extends ObjectRecord = ObjectRecord,
>({
  objectMetadataItem,
  objectMetadataItems,
}: GenerateObjectRecordSchemaParams) => {
  const recordTypeName = capitalize(objectMetadataItem.nameSingular);

  const recordSchema = z
    .object({
      __typename: z.literal(recordTypeName).default(recordTypeName),
    })
    .merge(
      z.object(
        Object.fromEntries(
          objectMetadataItem.fields.map((fieldMetadataItem) => [
            fieldMetadataItem.name,
            generateFieldSchema({ fieldMetadataItem, objectMetadataItems }),
          ]),
        ),
      ),
    );

  return recordSchema as z.ZodObject<
    z.ZodRawShape,
    'strip',
    z.ZodTypeAny,
    ValidatedObjectRecord & { __typename: string }
  >;
};
