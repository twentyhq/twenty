import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';

import { RecordFieldListComponentInstanceContext } from '@/object-record/record-field-list/states/contexts/RecordFieldListComponentInstanceContext';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { useWorkspaceSurfaceScopedComponentInstanceId } from '@/ui/layout/hooks/useWorkspaceSurfaceScopedComponentInstanceId';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';

const SIDE_PANEL_INSTANCE_ID = 'side-panel-page-instance';
const BASE_INSTANCE_ID = 'fields-widget-1-record-1';
const RECORD_ID = 'record-1';
const FIELD_NAME = 'name';

const buildWrapper =
  (surfaceType: 'main' | 'side-panel') =>
  ({ children }: { children: ReactNode }) => (
    <WorkspaceSurfaceContext.Provider
      value={{
        type: surfaceType,
        instanceId:
          surfaceType === 'side-panel' ? SIDE_PANEL_INSTANCE_ID : 'main',
        ownsRouteLocation: surfaceType === 'main',
      }}
    >
      {children}
    </WorkspaceSurfaceContext.Provider>
  );

// A field list renders its anchor elements with `prefix: instanceId`, and the
// anchored portal later finds them with document.getElementById after resolving
// the same context id through useAvailableComponentInstanceIdOrThrow. That
// resolution surface-scopes the id, so a list that provides an unscoped id
// renders anchors the portal can never find, and no editor opens.
const renderIds = ({
  surfaceType,
  provideScopedId,
}: {
  surfaceType: 'main' | 'side-panel';
  provideScopedId: boolean;
}) =>
  renderHook(
    () => {
      const scopedInstanceId =
        useWorkspaceSurfaceScopedComponentInstanceId(BASE_INSTANCE_ID);
      const providedInstanceId = provideScopedId
        ? scopedInstanceId
        : BASE_INSTANCE_ID;

      return { providedInstanceId };
    },
    { wrapper: buildWrapper(surfaceType) },
  );

const renderResolvedId = ({
  surfaceType,
  providedInstanceId,
}: {
  surfaceType: 'main' | 'side-panel';
  providedInstanceId: string;
}) =>
  renderHook(
    () =>
      useAvailableComponentInstanceIdOrThrow(
        RecordFieldListComponentInstanceContext,
      ),
    {
      wrapper: ({ children }: { children: ReactNode }) => {
        const Surface = buildWrapper(surfaceType);

        return (
          <Surface>
            <RecordFieldListComponentInstanceContext.Provider
              value={{ instanceId: providedInstanceId }}
            >
              {children}
            </RecordFieldListComponentInstanceContext.Provider>
          </Surface>
        );
      },
    },
  );

const anchorIdFor = (prefix: string) =>
  getRecordFieldInputInstanceId({
    recordId: RECORD_ID,
    fieldName: FIELD_NAME,
    prefix,
  });

describe('field list anchor ids and anchored portal lookups', () => {
  it.each(['main', 'side-panel'] as const)(
    'agree on %s when the list provides a surface-scoped instance id',
    (surfaceType) => {
      const { result: provided } = renderIds({
        surfaceType,
        provideScopedId: true,
      });
      const providedInstanceId = provided.current.providedInstanceId;

      const { result: resolved } = renderResolvedId({
        surfaceType,
        providedInstanceId,
      });

      expect(anchorIdFor(resolved.current)).toBe(
        anchorIdFor(providedInstanceId),
      );
    },
  );

  it('disagree in a side panel when the list provides an unscoped instance id', () => {
    const { result: provided } = renderIds({
      surfaceType: 'side-panel',
      provideScopedId: false,
    });
    const providedInstanceId = provided.current.providedInstanceId;

    const { result: resolved } = renderResolvedId({
      surfaceType: 'side-panel',
      providedInstanceId,
    });

    // This is the regression: document.getElementById(portal id) misses the
    // anchor the list rendered, so RecordInlineCellAnchoredPortal renders null.
    expect(anchorIdFor(resolved.current)).not.toBe(
      anchorIdFor(providedInstanceId),
    );
  });
});
