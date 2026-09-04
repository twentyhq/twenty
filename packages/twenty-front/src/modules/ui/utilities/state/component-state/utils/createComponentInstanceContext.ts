import { type ComponentInstanceStateContext } from '@/ui/utilities/state/component-state/types/ComponentInstanceStateContext';
import { type ComponentSurfaceScope } from '@/ui/utilities/state/component-state/types/ComponentSurfaceScope';
import { createContext } from 'react';

// surfaceScope is required so that adding a context is a deliberate choice
// between isolating its state per surface and sharing it across surfaces,
// rather than a default nobody revisits.
export const createComponentInstanceContext = <
  T extends { instanceId: string } = { instanceId: string },
>({
  surfaceScope,
  initialValue,
}: {
  surfaceScope: ComponentSurfaceScope;
  initialValue?: T;
}) => {
  const context = createContext<T | null>(
    initialValue ?? null,
  ) as ComponentInstanceStateContext<T>;

  context.surfaceScope = surfaceScope;

  return context;
};
