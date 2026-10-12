import { CoreObjectNameSingular } from 'twenty-shared/types';

import { isWorkspaceWorkflowVersionRouteHidden } from '@/object-core/workflows/utils/isWorkspaceWorkflowVersionRouteHidden';

describe('isWorkspaceWorkflowVersionRouteHidden', () => {
  it('should hide the workflow version route', () => {
    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
      }),
    ).toBe(true);
  });

  it('should not hide other objects', () => {
    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: CoreObjectNameSingular.Workflow,
      }),
    ).toBe(false);

    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: CoreObjectNameSingular.WorkflowRun,
      }),
    ).toBe(false);
  });

  it('should not hide anything when the route carries no object', () => {
    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: undefined,
      }),
    ).toBe(false);
  });
});
