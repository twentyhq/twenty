import { z } from 'zod';

import { baseEventSchema } from 'src/engine/core-modules/audit/utils/events/common/base-schemas';

export const genericTrackSchema = baseEventSchema.extend({
  type: z.literal('track'),
  event: z.string(),
  properties: z.any(),
});

export type GenericTrackEvent<E extends string = string> = {
  type: 'track';
  event: E;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: any;
  timestamp: string;
  version: string;
  userId?: string;
  workspaceId?: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const eventsRegistry = new Map<string, z.ZodSchema<any>>();

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function registerEvent<E extends string, S extends z.ZodObject<any>>(
  event: E,
  schema: S,
): void {
  eventsRegistry.set(event, genericTrackSchema.merge(schema));
}
