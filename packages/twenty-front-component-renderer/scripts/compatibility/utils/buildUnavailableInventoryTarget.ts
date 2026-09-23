import { isUndefined } from '@sniptt/guards';
import { type z } from 'zod';

import { type inventoryCollectionSchema } from '../schemas/inventoryCollectionSchema';
import { type inventoryMemberKeySchema } from '../schemas/inventoryMemberKeySchema';
import { type inventoryTargetSchema } from '../schemas/inventoryTargetSchema';
import { getInventoryMemberId } from './getInventoryMemberId';

export const buildUnavailableInventoryTarget = ({
  target,
  targetId,
  keys,
  status,
  reason,
}: {
  target: z.infer<typeof inventoryTargetSchema>;
  targetId: string;
  keys: z.infer<typeof inventoryMemberKeySchema>[] | undefined;
  status: 'missing' | 'uninspectable';
  reason: string;
}): z.infer<typeof inventoryCollectionSchema>['targets'][number] => {
  if (isUndefined(keys)) {
    throw new Error(`Reference target ${targetId}: ${reason}`);
  }
  return {
    target,
    status,
    reason,
    members: keys.map((key) => ({
      id: getInventoryMemberId({ targetId, key }),
      key,
      observation:
        status === 'missing'
          ? { shape: 'missing' as const }
          : { shape: 'uninspectable' as const, reason },
    })),
  };
};
