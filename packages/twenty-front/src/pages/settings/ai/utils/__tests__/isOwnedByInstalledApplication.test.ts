import { isOwnedByInstalledApplication } from '~/pages/settings/ai/utils/isOwnedByInstalledApplication';

describe('isOwnedByInstalledApplication', () => {
  it('is false without an application', () => {
    expect(
      isOwnedByInstalledApplication({
        applicationId: null,
        workspaceCustomApplicationId: 'workspace-app',
      }),
    ).toBe(false);
  });

  it("is false for the workspace's own application", () => {
    expect(
      isOwnedByInstalledApplication({
        applicationId: 'workspace-app',
        workspaceCustomApplicationId: 'workspace-app',
      }),
    ).toBe(false);
  });

  it('is true for any other application', () => {
    expect(
      isOwnedByInstalledApplication({
        applicationId: 'installed-app',
        workspaceCustomApplicationId: 'workspace-app',
      }),
    ).toBe(true);
  });
});
