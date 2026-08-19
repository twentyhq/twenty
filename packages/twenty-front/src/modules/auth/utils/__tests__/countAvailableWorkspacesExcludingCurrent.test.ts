import { countAvailableWorkspacesExcludingCurrent } from '@/auth/utils/countAvailableWorkspacesExcludingCurrent';
import {
  type AvailableWorkspace,
  type AvailableWorkspaces,
} from '~/generated-metadata/graphql';

const createMockAvailableWorkspace = (id: string): AvailableWorkspace => ({
  __typename: 'AvailableWorkspace',
  id,
  displayName: 'Test Workspace',
  logo: null,
  sso: [],
  workspaceUrls: {
    customUrl: null,
    subdomainUrl: 'https://test.twenty.com',
  },
});

const createMockAvailableWorkspaces = (
  signInWorkspaceIds: string[] = [],
  signUpWorkspaceIds: string[] = [],
): AvailableWorkspaces => ({
  __typename: 'AvailableWorkspaces',
  availableWorkspacesForSignIn: signInWorkspaceIds.map(
    createMockAvailableWorkspace,
  ),
  availableWorkspacesForSignUp: signUpWorkspaceIds.map(
    createMockAvailableWorkspace,
  ),
});

describe('countAvailableWorkspacesExcludingCurrent', () => {
  it('should not count the workspace the user is currently in', () => {
    const availableWorkspaces = createMockAvailableWorkspaces(
      ['workspace-1', 'workspace-2'],
      ['workspace-3'],
    );

    expect(
      countAvailableWorkspacesExcludingCurrent(
        availableWorkspaces,
        'workspace-1',
      ),
    ).toBe(2);
  });

  it('should count every workspace when the current one is not listed', () => {
    const availableWorkspaces = createMockAvailableWorkspaces(['workspace-1']);

    expect(
      countAvailableWorkspacesExcludingCurrent(
        availableWorkspaces,
        'workspace-2',
      ),
    ).toBe(1);
  });

  it('should count every workspace when there is no current workspace', () => {
    const availableWorkspaces = createMockAvailableWorkspaces(['workspace-1']);

    expect(
      countAvailableWorkspacesExcludingCurrent(availableWorkspaces, undefined),
    ).toBe(1);
  });

  it('should return 0 when the user is only in the current workspace', () => {
    const availableWorkspaces = createMockAvailableWorkspaces(['workspace-1']);

    expect(
      countAvailableWorkspacesExcludingCurrent(
        availableWorkspaces,
        'workspace-1',
      ),
    ).toBe(0);
  });
});
