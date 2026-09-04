import { type ComponentStateKey } from '@/ui/utilities/state/component-state/types/ComponentStateKey';
import { type ComponentSurfaceScope } from '@/ui/utilities/state/component-state/types/ComponentSurfaceScope';

// The single place a surface enters a component state's identity. Shared state
// keys on the instance id alone, so its atoms are the same ones every surface
// already used before scoping existed.
export const getComponentAtomCacheKey = ({
  surfaceScope,
  instanceId,
  surfaceId,
}: ComponentStateKey & {
  surfaceScope: ComponentSurfaceScope;
}): string =>
  surfaceScope === 'shared' ? instanceId : `${surfaceId}__${instanceId}`;
