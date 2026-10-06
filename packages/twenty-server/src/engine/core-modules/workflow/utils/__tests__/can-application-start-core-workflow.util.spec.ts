import { canApplicationStartCoreWorkflow } from 'src/engine/core-modules/workflow/utils/can-application-start-core-workflow.util';

const WORKSPACE_OWNED_APPLICATION_IDS = ['custom-app-id', 'standard-app-id'];

describe('canApplicationStartCoreWorkflow', () => {
  it('lets a request without an application start any workflow it can reach', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplicationId: undefined,
        workflowApplicationId: 'installed-app-id',
        workspaceOwnedApplicationIds: WORKSPACE_OWNED_APPLICATION_IDS,
      }),
    ).toBe(true);
  });

  it('keeps letting applications start workspace workflows', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplicationId: 'installed-app-id',
        workflowApplicationId: 'custom-app-id',
        workspaceOwnedApplicationIds: WORKSPACE_OWNED_APPLICATION_IDS,
      }),
    ).toBe(true);
  });

  it('lets an application start its own workflows', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplicationId: 'installed-app-id',
        workflowApplicationId: 'installed-app-id',
        workspaceOwnedApplicationIds: WORKSPACE_OWNED_APPLICATION_IDS,
      }),
    ).toBe(true);
  });

  it('refuses an application starting the workflow of another application', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplicationId: 'other-app-id',
        workflowApplicationId: 'installed-app-id',
        workspaceOwnedApplicationIds: WORKSPACE_OWNED_APPLICATION_IDS,
      }),
    ).toBe(false);
  });
});
