import { z } from 'zod';

export const nodeTextSchema = z.object({
  type: z.literal('text'),
  text: z.string(),
});

export const nodeImageSchema = z.object({
  type: z.literal('image'),
});

export const nodeFileSchema = z.object({
  type: z.literal('file'),
});

export const nodeActionSchema = z.discriminatedUnion('type', [
  nodeTextSchema,
  nodeImageSchema,
  nodeFileSchema,
]);

export const nodeConditionsSchema = z.object({
  type: z.literal('condition'),
});

export const otherNodeActionSchema = z.discriminatedUnion('type', [
  nodeConditionsSchema,
]);
