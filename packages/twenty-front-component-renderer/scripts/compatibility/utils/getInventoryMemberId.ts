import { type z } from 'zod';

import { type inventoryMemberKeySchema } from '../schemas/inventoryMemberKeySchema';

export const getInventoryMemberId = ({
  targetId,
  key,
}: {
  targetId: string;
  key: z.infer<typeof inventoryMemberKeySchema>;
}): string => {
  if (key.kind === 'well-known-symbol') {
    return `${targetId}[Symbol.${key.name}]`;
  }
  if (key.kind === 'registered-symbol') {
    return `${targetId}[Symbol.for(${JSON.stringify(key.name)})]`;
  }

  const identifierPattern = /^[A-Za-z_$][\w$]*$/;

  return identifierPattern.test(key.name)
    ? `${targetId}.${key.name}`
    : `${targetId}[${JSON.stringify(key.name)}]`;
};
