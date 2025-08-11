import { type StoreValue } from '@apollo/client';
import { z } from 'zod';

import { type RecordGqlRefConnection } from '@/object-record/cache/types/RecordGqlRefConnection';
import { capitalize } from 'twenty-shared/utils';

export const isObjectRecordConnectionWithRefs = (
  objectNameSingular: string,
  storeValue: StoreValue,
): storeValue is RecordGqlRefConnection => {
  const objectConnectionTypeName = `${capitalize(
    objectNameSingular,
  )}Connection`;
  const objectEdgeTypeName = `${capitalize(objectNameSingular)}Edge`;
  const cachedObjectConnectionSchema = z.object({
    __typename: z.literal(objectConnectionTypeName),
    edges: z.array(
      z.object({
        __typename: z.literal(objectEdgeTypeName),
        node: z.object({
          __ref: z.string().startsWith(`${capitalize(objectNameSingular)}:`),
        }),
      }),
    ),
  });
  const cachedConnectionValidation =
    cachedObjectConnectionSchema.safeParse(storeValue);

  return cachedConnectionValidation.success;
};
