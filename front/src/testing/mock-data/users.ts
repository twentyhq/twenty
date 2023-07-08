import { User, Workspace, WorkspaceMember } from '~/generated/graphql';

type MockedUser = Pick<
  User,
  | 'id'
  | 'email'
  | 'displayName'
  | 'avatarUrl'
  | '__typename'
  | 'firstName'
  | 'lastName'
> & {
  workspaceMember: Pick<WorkspaceMember, 'id' | '__typename'> & {
    workspace: Pick<
      Workspace,
      'id' | 'displayName' | 'domainName' | 'logo' | '__typename'
    >;
  };
};

export const mockedUsersData: Array<MockedUser> = [
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6d',
    __typename: 'User',
    email: 'charles@test.com',
    displayName: 'Charles Test',
    firstName: 'Charles',
    lastName: 'Test',
    avatarUrl: null,
    workspaceMember: {
      __typename: 'WorkspaceMember',
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      workspace: {
        __typename: 'Workspace',
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
        displayName: 'Twenty',
        domainName: 'twenty.com',
        logo: null,
      },
    },
  },
  {
    id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6c',
    __typename: 'User',
    email: 'felix@test.com',
    displayName: 'Felix Test',
    firstName: 'Felix',
    lastName: 'Test',
    workspaceMember: {
      __typename: 'WorkspaceMember',
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      workspace: {
        __typename: 'Workspace',
        id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
        displayName: 'Twenty',
        domainName: 'twenty.com',
        logo: null,
      },
    },
  },
];
