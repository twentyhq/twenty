import { getWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';

describe('getWorkspaceSurfaceScopedComponentInstanceId', () => {
  it('keeps main-surface component IDs unchanged', () => {
    expect(
      getWorkspaceSurfaceScopedComponentInstanceId({
        componentInstanceId: 'table',
        surfaceType: 'main',
        surfaceInstanceId: 'main',
      }),
    ).toBe('table');
  });

  it('scopes reusable component IDs once per side-panel instance', () => {
    const args = {
      surfaceType: 'side-panel' as const,
      surfaceInstanceId: 'panel-1',
    };

    expect(
      getWorkspaceSurfaceScopedComponentInstanceId({
        ...args,
        componentInstanceId: 'table',
      }),
    ).toBe('table-panel-1');
    expect(
      getWorkspaceSurfaceScopedComponentInstanceId({
        ...args,
        componentInstanceId: 'table-panel-1',
      }),
    ).toBe('table-panel-1');
  });

  it('preserves a component ID that is already the side-panel instance ID', () => {
    expect(
      getWorkspaceSurfaceScopedComponentInstanceId({
        componentInstanceId: 'panel-1',
        surfaceType: 'side-panel',
        surfaceInstanceId: 'panel-1',
      }),
    ).toBe('panel-1');
  });

  it('preserves a missing component ID', () => {
    expect(
      getWorkspaceSurfaceScopedComponentInstanceId({
        componentInstanceId: '',
        surfaceType: 'side-panel',
        surfaceInstanceId: 'panel-1',
      }),
    ).toBe('');
  });
});
