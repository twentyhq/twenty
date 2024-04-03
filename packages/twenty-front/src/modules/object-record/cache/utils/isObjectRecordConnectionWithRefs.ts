import { StoreValue } from '@apollo/client';
import { z } from 'zod';

import { CachedObjectRecordConnection } from '@/apollo/types/CachedObjectRecordConnection';
import { capitalize } from '~/utils/string/capitalize';

export const isObjectRecordConnectionWithRefs = (
  objectNameSingular: string,
  storeValue: StoreValue,
): storeValue is CachedObjectRecordConnection => {
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
