import { z } from 'zod';

import { inventoryMemberKeySchema } from './inventoryMemberKeySchema';

const presentDescriptor = {
  depth: z.number().int().nonnegative(),
  enumerable: z.boolean(),
  configurable: z.boolean(),
};

export const inventoryMemberSchema = z
  .strictObject({
    id: z.string().min(1),
    key: inventoryMemberKeySchema,
    observation: z.discriminatedUnion('shape', [
      z.strictObject({ shape: z.literal('missing') }),
      z.strictObject({
        shape: z.literal('uninspectable'),
        reason: z.string().min(1),
      }),
      z.strictObject({
        shape: z.enum(['callable', 'value']),
        ...presentDescriptor,
        writable: z.boolean(),
        valueType: z.enum([
          'undefined',
          'object',
          'boolean',
          'number',
          'bigint',
          'string',
          'symbol',
          'function',
        ]),
      }),
      z.strictObject({
        shape: z.literal('accessor'),
        ...presentDescriptor,
        getter: z.boolean(),
        setter: z.boolean(),
      }),
    ]),
  })
  .superRefine(({ observation }, context) => {
    if (
      (observation.shape === 'callable' &&
        observation.valueType !== 'function') ||
      (observation.shape === 'value' && observation.valueType === 'function')
    ) {
      context.addIssue({
        code: 'custom',
        message: 'Inconsistent callable value type',
      });
    }
  });
