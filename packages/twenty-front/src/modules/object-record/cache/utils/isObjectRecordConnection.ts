import { type StoreValue } from '@apollo/client';
import { z } from 'zod';

import { type RecordGqlConnection } from '@/object-record/graphql/types/RecordGqlConnection';
import { capitalize, getConnectionTypename } from 'twenty-shared/utils';

export const isObjectRecordConnection = (
  objectNameSingular: string,
  storeValue: StoreValue,
): storeValue is RecordGqlConnection => {
  const objectConnectionTypeName = getConnectionTypename(objectNameSingular);
  const objectEdgeTypeName = `${capitalize(objectNameSingular)}Edge`;
  const cachedObjectConnectionSchema = z.object({
    __typename: z.literal(objectConnectionTypeName),
    edges: z
      .array(
        z.object({
          __typename: z.literal(objectEdgeTypeName),
          node: z.object(),
        }),
      )
      .optional(),
  });
  const cachedConnectionValidation =
    cachedObjectConnectionSchema.safeParse(storeValue);

  return cachedConnectionValidation.success;
};
