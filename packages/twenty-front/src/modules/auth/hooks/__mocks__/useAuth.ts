import {
  ChallengeDocument,
  SignUpDocument,
  VerifyDocument,
} from '~/generated/graphql';

export const queries = {
  challenge: ChallengeDocument,
  verify: VerifyDocument,
  signup: SignUpDocument,
};

export const email = 'test@test.com';
export const password = 'testing';
export const token =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';

export const variables = {
  challenge: {
    email,
    password,
  },
  verify: { loginToken: token },
  signup: {},
};

export const results = {
  challenge: {
    loginToken: {
      token,
      expiresAt: '2022-01-01',
    },
  },
  verify: {
    user: {
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
      defaultWorkspace: {
        id: 'id',
        displayName: 'displayName',
        logo: 'logo',
        domainName: 'domainName',
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
    tokens: {
      accessToken: { token, expiresAt: 'expiresAt' },
      refreshToken: { token, expiresAt: 'expiresAt' },
    },
    signup: {},
  },
  signUp: { loginToken: { token, expiresAt: 'expiresAt' } },
};

export const mocks = [
  {
    request: {
      query: queries.challenge,
      variables: variables.challenge,
    },
    result: jest.fn(() => ({
      data: {
        challenge: results.challenge,
      },
    })),
  },
  {
    request: {
      query: queries.verify,
      variables: variables.verify,
    },
    result: jest.fn(() => ({
      data: {
        verify: results.verify,
      },
    })),
  },
  {
    request: {
      query: queries.signup,
      variables: variables.challenge,
    },
    result: jest.fn(() => ({
      data: {
        signUp: results.signUp,
      },
    })),
  },
];
