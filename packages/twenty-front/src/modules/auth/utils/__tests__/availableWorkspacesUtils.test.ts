import { AppPath } from 'twenty-shared/types';
import {
  type AvailableWorkspace,
  type AvailableWorkspaces,
} from '~/generated/graphql';
import {
  countAvailableWorkspaces,
  getAvailableWorkspacePathAndSearchParams,
  getFirstAvailableWorkspaces,
} from '@/auth/utils/availableWorkspacesUtils';

const createMockAvailableWorkspace = (
  overrides: Partial<AvailableWorkspace> = {},
): AvailableWorkspace => ({
  __typename: 'AvailableWorkspace',
  id: 'workspace-1',
  displayName: 'Test Workspace',
  logo: null,
  sso: [],
  workspaceUrls: {
    customUrl: null,
    subdomainUrl: 'https://test.twenty.com',
  },
  ...overrides,
});

const createMockAvailableWorkspaces = (
  signInWorkspaces: AvailableWorkspace[] = [],
  signUpWorkspaces: AvailableWorkspace[] = [],
): AvailableWorkspaces => ({
  __typename: 'AvailableWorkspaces',
  availableWorkspacesForSignIn: signInWorkspaces,
  availableWorkspacesForSignUp: signUpWorkspaces,
});

describe('availableWorkspacesUtils', () => {
  describe('countAvailableWorkspaces', () => {
    it('should return 0 when both arrays are empty', () => {
      const availableWorkspaces = createMockAvailableWorkspaces([], []);

      expect(countAvailableWorkspaces(availableWorkspaces)).toBe(0);
    });

    it('should count only sign-in workspaces when sign-up is empty', () => {
      const signInWorkspaces = [
        createMockAvailableWorkspace({ id: 'ws-1' }),
        createMockAvailableWorkspace({ id: 'ws-2' }),
      ];
      const availableWorkspaces = createMockAvailableWorkspaces(
        signInWorkspaces,
        [],
      );

      expect(countAvailableWorkspaces(availableWorkspaces)).toBe(2);
    });

    it('should count only sign-up workspaces when sign-in is empty', () => {
      const signUpWorkspaces = [
        createMockAvailableWorkspace({ id: 'ws-1' }),
        createMockAvailableWorkspace({ id: 'ws-2' }),
        createMockAvailableWorkspace({ id: 'ws-3' }),
      ];
      const availableWorkspaces = createMockAvailableWorkspaces(
        [],
        signUpWorkspaces,
      );

      expect(countAvailableWorkspaces(availableWorkspaces)).toBe(3);
    });

    it('should count workspaces from both arrays', () => {
      const signInWorkspaces = [
        createMockAvailableWorkspace({ id: 'ws-1' }),
        createMockAvailableWorkspace({ id: 'ws-2' }),
      ];
      const signUpWorkspaces = [
        createMockAvailableWorkspace({ id: 'ws-3' }),
        createMockAvailableWorkspace({ id: 'ws-4' }),
        createMockAvailableWorkspace({ id: 'ws-5' }),
      ];
      const availableWorkspaces = createMockAvailableWorkspaces(
        signInWorkspaces,
        signUpWorkspaces,
      );

      expect(countAvailableWorkspaces(availableWorkspaces)).toBe(5);
    });
  });

  describe('getFirstAvailableWorkspaces', () => {
    it('should return first sign-in workspace when available', () => {
      const signInWorkspace = createMockAvailableWorkspace({
        id: 'sign-in-ws',
        displayName: 'Sign In Workspace',
      });
      const signUpWorkspace = createMockAvailableWorkspace({
        id: 'sign-up-ws',
        displayName: 'Sign Up Workspace',
      });
      const availableWorkspaces = createMockAvailableWorkspaces(
        [signInWorkspace],
        [signUpWorkspace],
      );

      expect(getFirstAvailableWorkspaces(availableWorkspaces)).toEqual(
        signInWorkspace,
      );
    });

    it('should return first sign-up workspace when sign-in is empty', () => {
      const signUpWorkspace = createMockAvailableWorkspace({
        id: 'sign-up-ws',
        displayName: 'Sign Up Workspace',
      });
      const availableWorkspaces = createMockAvailableWorkspaces(
        [],
        [signUpWorkspace],
      );

      expect(getFirstAvailableWorkspaces(availableWorkspaces)).toEqual(
        signUpWorkspace,
      );
    });

    it('should return undefined when both arrays are empty', () => {
      const availableWorkspaces = createMockAvailableWorkspaces([], []);

      expect(getFirstAvailableWorkspaces(availableWorkspaces)).toBeUndefined();
    });

    it('should prioritize sign-in over sign-up workspace', () => {
      const firstSignInWorkspace = createMockAvailableWorkspace({
        id: 'first-sign-in',
      });
      const secondSignInWorkspace = createMockAvailableWorkspace({
        id: 'second-sign-in',
      });
      const signUpWorkspace = createMockAvailableWorkspace({
        id: 'sign-up-ws',
      });
      const availableWorkspaces = createMockAvailableWorkspaces(
        [firstSignInWorkspace, secondSignInWorkspace],
        [signUpWorkspace],
      );

      expect(getFirstAvailableWorkspaces(availableWorkspaces)).toEqual(
        firstSignInWorkspace,
      );
    });
  });

  describe('getAvailableWorkspacePathAndSearchParams', () => {
    describe('when workspace has loginToken', () => {
      it('should return Verify path with loginToken in search params', () => {
        const workspace = createMockAvailableWorkspace({
          loginToken: 'test-login-token',
        });

        const result = getAvailableWorkspacePathAndSearchParams(workspace);

        expect(result).toEqual({
          pathname: AppPath.Verify,
          searchParams: { loginToken: 'test-login-token' },
        });
      });

      it('should include default search params with loginToken', () => {
        const workspace = createMockAvailableWorkspace({
          loginToken: 'test-login-token',
        });

        const result = getAvailableWorkspacePathAndSearchParams(workspace, {
          foo: 'bar',
        });

        expect(result).toEqual({
          pathname: AppPath.Verify,
          searchParams: { foo: 'bar', loginToken: 'test-login-token' },
        });
      });
    });

    describe('when workspace has personalInviteToken and inviteHash', () => {
      it('should return Invite path with inviteToken in search params', () => {
        const workspace = createMockAvailableWorkspace({
          personalInviteToken: 'test-invite-token',
          inviteHash: 'test-invite-hash',
        });

        const result = getAvailableWorkspacePathAndSearchParams(workspace);

        expect(result).toEqual({
          pathname: '/invite/test-invite-hash',
          searchParams: { inviteToken: 'test-invite-token' },
        });
      });

      it('should include default search params with inviteToken', () => {
        const workspace = createMockAvailableWorkspace({
          personalInviteToken: 'test-invite-token',
          inviteHash: 'test-invite-hash',
        });

        const result = getAvailableWorkspacePathAndSearchParams(workspace, {
          source: 'email',
        });

        expect(result).toEqual({
          pathname: '/invite/test-invite-hash',
          searchParams: { source: 'email', inviteToken: 'test-invite-token' },
        });
      });
    });

    describe('when workspace has only personalInviteToken without inviteHash', () => {
      it('should return SignInUp path with inviteToken in search params', () => {
        const workspace = createMockAvailableWorkspace({
          personalInviteToken: 'test-invite-token',
          inviteHash: undefined,
        });

        const result = getAvailableWorkspacePathAndSearchParams(workspace);

        expect(result).toEqual({
          pathname: AppPath.SignInUp,
          searchParams: { inviteToken: 'test-invite-token' },
        });
      });
    });

    describe('when workspace has neither loginToken nor invite tokens', () => {
      it('should return SignInUp path with empty search params', () => {
        const workspace = createMockAvailableWorkspace();

        const result = getAvailableWorkspacePathAndSearchParams(workspace);

        expect(result).toEqual({
          pathname: AppPath.SignInUp,
          searchParams: {},
        });
      });

      it('should preserve default search params', () => {
        const workspace = createMockAvailableWorkspace();

        const result = getAvailableWorkspacePathAndSearchParams(workspace, {
          redirect: '/dashboard',
        });

        expect(result).toEqual({
          pathname: AppPath.SignInUp,
          searchParams: { redirect: '/dashboard' },
        });
      });
    });

    describe('priority: loginToken over invite tokens', () => {
      it('should prioritize loginToken when both loginToken and invite tokens exist', () => {
        const workspace = createMockAvailableWorkspace({
          loginToken: 'test-login-token',
          personalInviteToken: 'test-invite-token',
          inviteHash: 'test-invite-hash',
        });

        const result = getAvailableWorkspacePathAndSearchParams(workspace);

        expect(result).toEqual({
          pathname: AppPath.Verify,
          searchParams: { loginToken: 'test-login-token' },
        });
      });
    });
  });
});
