import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { createComponentInstanceContext } from '@/ui/utilities/state/component-state/utils/createComponentInstanceContext';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

const ComponentInstanceContext = createComponentInstanceContext();

const SidePanelWrapper = ({ children }: { children: ReactNode }) => (
  <WorkspaceSurfaceContext.Provider
    value={{
      type: 'side-panel',
      instanceId: 'side-panel-page-id',
      ownsRouteLocation: false,
    }}
  >
    <ComponentInstanceContext.Provider value={{ instanceId: 'context-id' }}>
      {children}
    </ComponentInstanceContext.Provider>
  </WorkspaceSurfaceContext.Provider>
);

describe('useAvailableComponentInstanceIdOrThrow', () => {
  it('keeps an explicitly provided instance ID unchanged', () => {
    const { result } = renderHook(
      () =>
        useAvailableComponentInstanceIdOrThrow(
          ComponentInstanceContext,
          'explicit-id',
        ),
      { wrapper: SidePanelWrapper },
    );

    expect(result.current).toBe('explicit-id');
  });

  it('scopes a context instance ID to the workspace surface', () => {
    const { result } = renderHook(
      () => useAvailableComponentInstanceIdOrThrow(ComponentInstanceContext),
      { wrapper: SidePanelWrapper },
    );

    expect(result.current).toBe('context-id-side-panel-page-id');
  });
});
