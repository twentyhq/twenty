import { type Context } from 'react';

export type ComponentInstanceStateContext<T extends { instanceId: string }> =
  Context<T | null>;
