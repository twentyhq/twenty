import { z } from 'zod';

import { ObjectRecordConnection } from '@/object-record/types/ObjectRecordConnection';
import { capitalize } from '~/utils/string/capitalize';

export const isObjectRecordConnection = (
  objectNameSingular: string,
  value: unknown,
): value is ObjectRecordConnection => {
  const objectConnectionTypeName = `${capitalize(
    objectNameSingular,
  )}Connection`;
  const objectEdgeTypeName = `${capitalize(objectNameSingular)}Edge`;

  const objectConnectionSchema = z.object({
    __typename: z.literal(objectConnectionTypeName).optional(),
    edges: z.array(
      z.object({
        __typename: z.literal(objectEdgeTypeName).optional(),
        node: z.object({
          id: z.string().uuid(),
        }),
      }),
    ),
  });

  const connectionValidation = objectConnectionSchema.safeParse(value);

  return connectionValidation.success;
};
