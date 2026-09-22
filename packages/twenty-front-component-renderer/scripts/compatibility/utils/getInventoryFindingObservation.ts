import { type z } from 'zod';

import { type inventoryFindingSchema } from '../schemas/inventoryFindingSchema';
import { type inventoryMemberSchema } from '../schemas/inventoryMemberSchema';

type InventoryMemberObservation = z.infer<
  typeof inventoryMemberSchema
>['observation'];

export const getInventoryFindingObservation = ({
  reference,
  sandbox,
}: {
  reference: InventoryMemberObservation;
  sandbox: InventoryMemberObservation;
}): z.infer<typeof inventoryFindingSchema>['observation'] => {
  if (reference.shape === 'uninspectable') {
    return 'uninspectable';
  }
  if (sandbox.shape === 'missing' || sandbox.shape === 'uninspectable') {
    return sandbox.shape;
  }
  const isShapeDifferent =
    sandbox.shape !== reference.shape ||
    (sandbox.shape === 'accessor' &&
      reference.shape === 'accessor' &&
      (sandbox.getter !== reference.getter ||
        sandbox.setter !== reference.setter)) ||
    (sandbox.shape === 'value' &&
      reference.shape === 'value' &&
      sandbox.valueType !== reference.valueType);
  if (isShapeDifferent) {
    return 'shape-mismatch';
  }
  return 'present-behavior-unverified';
};
