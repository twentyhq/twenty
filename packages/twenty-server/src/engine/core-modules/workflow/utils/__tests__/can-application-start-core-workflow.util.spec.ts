import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { canApplicationStartCoreWorkflow } from 'src/engine/core-modules/workflow/utils/can-application-start-core-workflow.util';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'custom-app-id';

const installedApplication = {
  id: 'installed-app-id',
  universalIdentifier: 'installed-app-universal-identifier',
  sourceType: ApplicationRegistrationSourceType.NPM,
};

describe('canApplicationStartCoreWorkflow', () => {
  it('lets a request without an application start any workflow it can reach', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplication: undefined,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        workflowApplicationId: 'installed-app-id',
      }),
    ).toBe(true);
  });

  it('lets an application start its own workflows', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplication: installedApplication,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        workflowApplicationId: 'installed-app-id',
      }),
    ).toBe(true);
  });

  it('refuses an application starting a workspace workflow', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplication: installedApplication,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        workflowApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      }),
    ).toBe(false);
  });

  it('refuses an application starting the workflow of another application', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplication: installedApplication,
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        workflowApplicationId: 'other-app-id',
      }),
    ).toBe(false);
  });

  it('lets the workspace custom application start the workflow of another application', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplication: {
          id: WORKSPACE_CUSTOM_APPLICATION_ID,
          universalIdentifier: WORKSPACE_CUSTOM_APPLICATION_ID,
          sourceType: ApplicationRegistrationSourceType.LOCAL,
        },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        workflowApplicationId: 'installed-app-id',
      }),
    ).toBe(true);
  });

  it('refuses an OAuth client starting the workflow of an application', () => {
    expect(
      canApplicationStartCoreWorkflow({
        callerApplication: {
          id: 'oauth-app-id',
          universalIdentifier: 'oauth-app-universal-identifier',
          sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        },
        workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        workflowApplicationId: 'installed-app-id',
      }),
    ).toBe(false);
  });
});
