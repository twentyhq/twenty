import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { resolveAgentRunCallingApplication } from 'src/engine/metadata-modules/ai/ai-agent-execution/utils/resolve-agent-run-calling-application.util';

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

const buildApplicationContext = (
  application: FlatApplication,
): WorkspaceAuthContext => ({ type: 'application', workspace, application });

describe('resolveAgentRunCallingApplication', () => {
  it('should keep the workspace custom application', () => {
    expect(
      resolveAgentRunCallingApplication(
        buildApplicationContext(workspaceCustomApplication),
      ),
    ).toBe(workspaceCustomApplication);
  });

  it('should keep an installed application', () => {
    expect(
      resolveAgentRunCallingApplication(
        buildApplicationContext(installedApplication),
      ),
    ).toBe(installedApplication);
  });

  it('should drop the standard application', () => {
    expect(
      resolveAgentRunCallingApplication(
        buildApplicationContext(standardApplication),
      ),
    ).toBeUndefined();
  });

  it('should drop the standard application a member acts through', () => {
    expect(
      resolveAgentRunCallingApplication({
        type: 'user',
        workspace,
        viaApplication: standardApplication,
      } as WorkspaceAuthContext),
    ).toBeUndefined();
  });

  it('should resolve no application without an auth context', () => {
    expect(resolveAgentRunCallingApplication(undefined)).toBeUndefined();
  });
});
