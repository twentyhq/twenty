import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { getAuthContextApplication } from 'src/engine/core-modules/auth/utils/get-auth-context-application.util';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';

const workspace = {
  id: 'workspace-id',
  workspaceCustomApplicationId: 'workspace-custom-application-id',
} as FlatWorkspace;

const workspaceCustomApplication = {
  id: 'workspace-custom-application-id',
  universalIdentifier: 'workspace-custom-application-id',
} as FlatApplication;

const standardApplication = {
  id: 'standard-application-id',
  universalIdentifier: TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
} as FlatApplication;

const installedApplication = {
  id: 'installed-application-id',
  universalIdentifier: 'installed-application-universal-identifier',
} as FlatApplication;

describe('getAuthContextApplication', () => {
  it.each([
    ['workspace custom', workspaceCustomApplication],
    ['standard', standardApplication],
    ['installed', installedApplication],
  ])(
    'should return the %s application a token acts through',
    (_, application) => {
      expect(
        getAuthContextApplication({
          type: 'application',
          workspace,
          application,
        }),
      ).toBe(application);
    },
  );

  it('should return the application a member acts through', () => {
    expect(
      getAuthContextApplication({
        type: 'user',
        workspace,
        viaApplication: standardApplication,
      } as WorkspaceAuthContext),
    ).toBe(standardApplication);
  });

  it('should return no application for a member acting directly', () => {
    expect(
      getAuthContextApplication({
        type: 'user',
        workspace,
      } as WorkspaceAuthContext),
    ).toBeUndefined();
  });

  it('should return no application without an auth context', () => {
    expect(getAuthContextApplication(undefined)).toBeUndefined();
  });
});
