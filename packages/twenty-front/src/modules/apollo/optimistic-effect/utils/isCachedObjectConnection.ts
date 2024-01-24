import { StoreValue } from '@apollo/client';
import { z } from 'zod';

import { CachedObjectRecordConnection } from '@/apollo/types/CachedObjectRecordConnection';
import { capitalize } from '~/utils/string/capitalize';

export const isCachedObjectConnection = (
  objectNameSingular: string,
  storeValue: StoreValue,
): storeValue is CachedObjectRecordConnection => {
  const objectConnectionTypeName = `${capitalize(
    objectNameSingular,
  )}Connection`;
  const cachedObjectConnectionSchema = z.object({
    __typename: z.literal(objectConnectionTypeName),
  });
  const cachedConnectionValidation =
    cachedObjectConnectionSchema.safeParse(storeValue);

  return cachedConnectionValidation.success;
};
