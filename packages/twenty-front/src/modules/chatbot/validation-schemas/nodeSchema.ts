import { z } from 'zod';

export const nodeTextSchema = z.object({
  type: z.literal('TEXT'),
  text: z.string(),
});

export const nodeImageSchema = z.object({
  type: z.literal('IMAGE'),
});

export const nodeFileSchema = z.object({
  type: z.literal('FILE'),
});

export const nodeActionSchema = z.discriminatedUnion('type', [
  nodeTextSchema,
  nodeImageSchema,
  nodeFileSchema,
]);

export const nodeConditionsSchema = z.object({
  type: z.literal('CONDITION'),
});

export const otherNodeActionSchema = z.discriminatedUnion('type', [
  nodeConditionsSchema,
]);
