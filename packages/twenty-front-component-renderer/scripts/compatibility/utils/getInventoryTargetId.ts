import { type z } from 'zod';

import { type inventoryTargetSchema } from '../schemas/inventoryTargetSchema';

export const getInventoryTargetId = (
  target: z.infer<typeof inventoryTargetSchema>,
): string => {
  if (target.kind === 'factory') {
    return `instance:${target.name}`;
  }
  if (target.kind === 'global') {
    return target.surface;
  }
  const suffix = target.kind === 'prototype' ? '.prototype' : '';

  return `${target.surface}.${target.name}${suffix}`;
};
