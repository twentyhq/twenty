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
    avatarUrl:
      'https://s3-alpha-sig.figma.com/img/bbb5/4905/f0a52cc2b9aaeb0a82a360d478dae8bf?Expires=1687132800&Signature=iVBr0BADa3LHoFVGbwqO-wxC51n1o~ZyFD-w7nyTyFP4yB-Y6zFawL-igewaFf6PrlumCyMJThDLAAc-s-Cu35SBL8BjzLQ6HymzCXbrblUADMB208PnMAvc1EEUDq8TyryFjRO~GggLBk5yR0EXzZ3zenqnDEGEoQZR~TRqS~uDF-GwQB3eX~VdnuiU2iittWJkajIDmZtpN3yWtl4H630A3opQvBnVHZjXAL5YPkdh87-a-H~6FusWvvfJxfNC2ZzbrARzXofo8dUFtH7zUXGCC~eUk~hIuLbLuz024lFQOjiWq2VKyB7dQQuGFpM-OZQEV8tSfkViP8uzDLTaCg__&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4',
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
