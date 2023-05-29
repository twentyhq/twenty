import {
  mapToGqlUser,
  mapToUser,
  User,
  GraphqlMutationUser,
  GraphqlQueryUser,
} from '../user.interface';

describe('User mappers', () => {
  it('should map GraphqlUser to User', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const graphQLUser = {
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      displayName: 'John Doe',
      email: 'john.doe@gmail.com',
      workspaceMember: {
        id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e88',
        workspace: {
          id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e89',
          displayName: 'John Doe',
          __typename: 'workspace',
        },
        __typename: 'workspace_members',
      },
      __typename: 'users',
    } satisfies GraphqlQueryUser;

    const User = mapToUser(graphQLUser);
    expect(User).toStrictEqual({
      __typename: 'users',
      id: graphQLUser.id,
      displayName: graphQLUser.displayName,
      email: graphQLUser.email,
      workspaceMember: {
        id: graphQLUser.workspaceMember.id,
        workspace: {
          id: graphQLUser.workspaceMember.workspace.id,
          displayName: graphQLUser.workspaceMember.workspace.displayName,
          domainName: undefined,
          logo: undefined,
        },
      },
    } satisfies User);
  });

  it('should map User to GraphQlUser', () => {
    const now = new Date();
    now.setMilliseconds(0);
    const user = {
      __typename: 'users',
      id: '7dfbc3f7-6e5e-4128-957e-8d86808cdf6b',
      displayName: 'John Doe',
      email: 'john.doe@gmail.com',
      workspaceMember: {
        id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e88',
        workspace: {
          id: '7af20dea-0412-4c4c-8b13-d6f0e6e09e89',
          displayName: 'John Doe',
        },
      },
    } satisfies User;

    const graphQLUser = mapToGqlUser(user);
    expect(graphQLUser).toStrictEqual({
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      workspaceMemberId: user.workspaceMember.id,
      __typename: 'users',
    } satisfies GraphqlMutationUser);
  });
});
