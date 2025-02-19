import {
  GetAuthTokensFromLoginTokenDocument,
  GetCurrentUserDocument,
  GetLoginTokenFromCredentialsDocument,
  SignUpDocument,
} from '~/generated/graphql';

export const queries = {
  getLoginTokenFromCredentials: GetLoginTokenFromCredentialsDocument,
  getAuthTokensFromLoginToken: GetAuthTokensFromLoginTokenDocument,
  signup: SignUpDocument,
  getCurrentUser: GetCurrentUserDocument,
};

export const email = 'test@test.com';
export const password = 'testing';
export const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export const variables = {
  getLoginTokenFromCredentials: {
    email,
    password,
  },
  getAuthTokensFromLoginToken: { loginToken: token },
  signup: {
    email,
    password,
    workspacePersonalInviteToken: null,
    locale: "",
  },
  getCurrentUser: {},
};

export const results = {
  getLoginTokenFromCredentials: {
    loginToken: {
      token,
      expiresAt: '2022-01-01',
    },
  },
  getAuthTokensFromLoginToken: {
    tokens: {
      accessToken: { token, expiresAt: 'expiresAt' },
      refreshToken: { token, expiresAt: 'expiresAt' },
    },
  },
  signUp: { loginToken: { token, expiresAt: 'expiresAt' } },
  getCurrentUser: {
    currentUser: {
      id: 'id',
      firstName: 'firstName',
      lastName: 'lastName',
      email: 'email',
      canImpersonate: 'canImpersonate',
      supportUserHash: 'supportUserHash',
      workspaceMember: {
        id: 'id',
        name: {
          firstName: 'firstName',
          lastName: 'lastName',
        },
        colorScheme: 'colorScheme',
        avatarUrl: 'avatarUrl',
        locale: 'locale',
      },
      currentWorkspace: {
        id: 'id',
        displayName: 'displayName',
        logo: 'logo',
        inviteHash: 'inviteHash',
        allowImpersonation: true,
        subscriptionStatus: 'subscriptionStatus',
        featureFlags: {
          id: 'id',
          key: 'key',
          value: 'value',
          workspaceId: 'workspaceId',
        },
      },
    },
  },
};

export const mocks = [
  {
    request: {
      query: queries.getLoginTokenFromCredentials,
      variables: variables.getLoginTokenFromCredentials,
    },
    result: jest.fn(() => ({
      data: {
        getLoginTokenFromCredentials: results.getLoginTokenFromCredentials,
      },
    })),
  },
  {
    request: {
      query: queries.getAuthTokensFromLoginToken,
      variables: variables.getAuthTokensFromLoginToken,
    },
    result: jest.fn(() => ({
      data: {
        getAuthTokensFromLoginToken: results.getAuthTokensFromLoginToken,
      },
    })),
  },
  {
    request: {
      query: queries.signup,
      variables: variables.signup,
    },
    result: jest.fn(() => ({
      data: {
        signUp: results.signUp,
      },
    })),
  },
  {
    request: {
      query: queries.getCurrentUser,
      variables: variables.getCurrentUser,
    },
    result: jest.fn(() => ({
      data: results.getCurrentUser,
    })),
  },
];
