import { isWorkspaceCustomApplication } from 'src/engine/core-modules/application/utils/is-workspace-custom-application.util';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'c3d4e5f6-a7b8-4c9d-8e0f-1a2b3c4d5e6f';

describe('isWorkspaceCustomApplication', () => {
  it('should recognize the workspace custom application', () => {
    expect(
      isWorkspaceCustomApplication({
        application: { id: WORKSPACE_CUSTOM_APPLICATION_ID },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe(true);
  });

  it('should not recognize another application', () => {
    expect(
      isWorkspaceCustomApplication({
        application: { id: 'b1a4c0d2-6e1f-4a6b-9c1d-0f2e3a4b5c6d' },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe(false);
  });

  it("should not recognize the custom application when the workspace's one is unknown", () => {
    expect(
      isWorkspaceCustomApplication({
        application: { id: WORKSPACE_CUSTOM_APPLICATION_ID },
        workspaceCustomApplicationId: undefined,
      }),
    ).toBe(false);
  });
});
