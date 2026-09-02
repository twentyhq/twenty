import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useAvailableComponentInstanceId } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

const CONTEXT_INSTANCE_ID = 'record-field-list-from-context';
const PROPS_INSTANCE_ID = 'record-field-list-from-props';

const buildWrapper =
  ({
    surfaceType,
    provideContext,
  }: {
    surfaceType: 'main' | 'side-panel';
    provideContext: boolean;
  }) =>
  ({ children }: { children: ReactNode }) => (
    <WorkspaceSurfaceContext.Provider
      value={{
        type: surfaceType,
        instanceId:
          surfaceType === 'side-panel'
            ? 'side-panel-page'
            : MAIN_CONTEXT_STORE_INSTANCE_ID,
        ownsRouteLocation: surfaceType === 'main',
      }}
    >
      {provideContext ? (
        <RecordFieldListComponentInstanceContext.Provider
          value={{ instanceId: CONTEXT_INSTANCE_ID }}
        >
          {children}
        </RecordFieldListComponentInstanceContext.Provider>
      ) : (
        children
      )}
    </WorkspaceSurfaceContext.Provider>
  );

// Surface isolation is opted into where an id is created, at the provider.
// These hooks must hand back exactly what they were given on every surface:
// a side panel may deliberately provide the same id as the main surface to
// share state with it, and ids are also rendered into DOM anchors that get
// looked up by the exact string the provider used.
describe('useAvailableComponentInstanceIdOrThrow', () => {
  it.each(['main', 'side-panel'] as const)(
    'returns the context id verbatim on a %s surface',
    (surfaceType) => {
      const { result } = renderHook(
        () =>
          useAvailableComponentInstanceIdOrThrow(
            RecordFieldListComponentInstanceContext,
          ),
        { wrapper: buildWrapper({ surfaceType, provideContext: true }) },
      );

      expect(result.current).toBe(CONTEXT_INSTANCE_ID);
    },
  );

  it.each(['main', 'side-panel'] as const)(
    'returns an explicit id verbatim on a %s surface',
    (surfaceType) => {
      const { result } = renderHook(
        () =>
          useAvailableComponentInstanceIdOrThrow(
            RecordFieldListComponentInstanceContext,
            PROPS_INSTANCE_ID,
          ),
        { wrapper: buildWrapper({ surfaceType, provideContext: true }) },
      );

      expect(result.current).toBe(PROPS_INSTANCE_ID);
    },
  );

  it('throws when no id is provided or in context', () => {
    expect(() =>
      renderHook(
        () =>
          useAvailableComponentInstanceIdOrThrow(
            RecordFieldListComponentInstanceContext,
          ),
        {
          wrapper: buildWrapper({ surfaceType: 'main', provideContext: false }),
        },
      ),
    ).toThrow('Instance id is not provided and cannot be found in context.');
  });
});

describe('useAvailableComponentInstanceId', () => {
  it.each(['main', 'side-panel'] as const)(
    'returns the context id verbatim on a %s surface',
    (surfaceType) => {
      const { result } = renderHook(
        () =>
          useAvailableComponentInstanceId(
            RecordFieldListComponentInstanceContext,
          ),
        { wrapper: buildWrapper({ surfaceType, provideContext: true }) },
      );

      expect(result.current).toBe(CONTEXT_INSTANCE_ID);
    },
  );

  it('returns null when there is no context', () => {
    const { result } = renderHook(
      () =>
        useAvailableComponentInstanceId(
          RecordFieldListComponentInstanceContext,
        ),
      {
        wrapper: buildWrapper({
          surfaceType: 'side-panel',
          provideContext: false,
        }),
      },
    );

    expect(result.current).toBeNull();
  });
});
