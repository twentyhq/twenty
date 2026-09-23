import { isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryMemberKeySchema } from '../schemas/inventoryMemberKeySchema';
import { type inventoryMemberSchema } from '../schemas/inventoryMemberSchema';
import { getInventoryPropertyKey } from './getInventoryPropertyKey';

export const observeUndescribedInventoryMember = ({
  value,
  id,
  key,
}: {
  value: object;
  id: string;
  key: z.infer<typeof inventoryMemberKeySchema>;
}): z.infer<typeof inventoryMemberSchema> => {
  const propertyKey = getInventoryPropertyKey(key);
  if (isUndefined(propertyKey)) {
    return { id, key, observation: { shape: 'missing' } };
  }
  try {
    const servedValue: unknown = Reflect.get(value, propertyKey);
    if (isUndefined(servedValue)) {
      return { id, key, observation: { shape: 'missing' } };
    }
    return {
      id,
      key,
      observation: {
        shape: 'uninspectable',
        reason: `Served without a property descriptor (${typeof servedValue})`,
      },
    };
  } catch (error) {
    return {
      id,
      key,
      observation: { shape: 'uninspectable', reason: String(error) },
    };
  }
};
