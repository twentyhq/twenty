import { type Context } from 'react';

import { type ComponentSurfaceScope } from '@/ui/utilities/state/component-state/types/ComponentSurfaceScope';

export type ComponentInstanceStateContext<T extends { instanceId: string }> =
  Context<T | null> & { surfaceScope: ComponentSurfaceScope };
