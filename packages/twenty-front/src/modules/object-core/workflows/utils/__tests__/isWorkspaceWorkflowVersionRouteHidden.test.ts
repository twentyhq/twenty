import { CoreObjectNameSingular } from 'twenty-shared/types';

import { isWorkspaceWorkflowVersionRouteHidden } from '@/object-core/workflows/utils/isWorkspaceWorkflowVersionRouteHidden';

describe('isWorkspaceWorkflowVersionRouteHidden', () => {
  it('should hide the workflow version route when the flag is on', () => {
    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(true);
  });

  it('should keep the workflow version route when the flag is off', () => {
    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        isWorkflowCoreIndexPageEnabled: false,
      }),
    ).toBe(false);
  });

  it('should not hide other objects when the flag is on', () => {
    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: CoreObjectNameSingular.Workflow,
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(false);

    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: CoreObjectNameSingular.WorkflowRun,
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(false);
  });

  it('should not hide anything when the route carries no object', () => {
    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: undefined,
        isWorkflowCoreIndexPageEnabled: true,
      }),
    ).toBe(false);
  });
});
