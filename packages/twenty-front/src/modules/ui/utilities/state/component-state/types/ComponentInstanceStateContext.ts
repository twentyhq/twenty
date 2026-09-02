import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { type Context } from 'react';

export type ComponentInstanceStateContext<T extends ComponentStateKey> =
  Context<T | null>;
