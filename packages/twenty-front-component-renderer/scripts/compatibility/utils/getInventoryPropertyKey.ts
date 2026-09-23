import { isSymbol } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryMemberKeySchema } from '../schemas/inventoryMemberKeySchema';

export const getInventoryPropertyKey = (
  key: z.infer<typeof inventoryMemberKeySchema>,
): PropertyKey | undefined => {
  if (key.kind === 'string') {
    return key.name;
  }
  if (key.kind === 'registered-symbol') {
    return Symbol.for(key.name);
  }
  const wellKnownSymbol: unknown = Object.getOwnPropertyDescriptor(
    Symbol,
    key.name,
  )?.value;
  return isSymbol(wellKnownSymbol) ? wellKnownSymbol : undefined;
};
