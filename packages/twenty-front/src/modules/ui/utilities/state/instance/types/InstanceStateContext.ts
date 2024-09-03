import { Context } from 'react';

export type InstanceStateContext<T extends { instanceId: string }> =
  Context<T | null>;
