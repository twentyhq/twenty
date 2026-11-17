import { StandardObjectNameSingular } from 'twenty-shared/types';

import { isWorkspaceWorkflowVersionRouteHidden } from '@/object-core/workflows/utils/isWorkspaceWorkflowVersionRouteHidden';

describe('isWorkspaceWorkflowVersionRouteHidden', () => {
  it('should hide the workflow version route', () => {
    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: StandardObjectNameSingular.WorkflowVersion,
      }),
    ).toBe(true);
  });

  it('should not hide other objects', () => {
    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: StandardObjectNameSingular.Workflow,
      }),
    ).toBe(false);

    expect(
      isWorkspaceWorkflowVersionRouteHidden({
        objectNameSingular: StandardObjectNameSingular.WorkflowRun,
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
