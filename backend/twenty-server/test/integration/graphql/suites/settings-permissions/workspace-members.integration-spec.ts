import { deleteOneOperationFactory } from 'test/integration/graphql/utils/delete-one-operation-factory.util';
import { makeGraphqlAPIRequestWithMemberRole } from 'test/integration/graphql/utils/make-graphql-api-request-with-member-role.util';
import { updateOneOperationFactory } from 'test/integration/graphql/utils/update-one-operation-factory.util';

import { ErrorCode } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { PermissionsExceptionMessage } from 'src/engine/metadata-modules/permissions/permissions.exception';
import { WORKSPACE_MEMBER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/workspace-member-data-seeds.constant';

const WORKSPACE_MEMBER_GQL_FIELDS = `
    id
    name {
      firstName
    }
`;

describe('workspace members permissions', () => {
  it('should allow update when user is updating themself (member role)', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
      data: {
        name: {
          firstName: 'Jony',
        },
      },
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.errors).not.toBeDefined();
    expect(response.body.data).toStrictEqual({
      updateWorkspaceMember: {
        id: WORKSPACE_MEMBER_DATA_SEED_IDS.JONY,
        name: {
          firstName: 'Jony',
        },
      },
    });
    expect(response.body.errors).toBeUndefined();
  });
  it('should throw when user does not have permission (member role)', async () => {
    const graphqlOperation = updateOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
      data: {
        name: {
          firstName: 'Not Tim',
        },
      },
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ updateWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      PermissionsExceptionMessage.PERMISSION_DENIED,
    );
    expect(response.body.errors[0].extensions.code).toBe(ErrorCode.FORBIDDEN);
  });

  it('should throw when calling deleteOne ', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ deleteWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'Please use /deleteUserFromWorkspace to remove a workspace member.',
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });

  it('should throw when calling deleteMany', async () => {
    const graphqlOperation = deleteOneOperationFactory({
      objectMetadataSingularName: 'workspaceMember',
      gqlFields: WORKSPACE_MEMBER_GQL_FIELDS,
      recordId: WORKSPACE_MEMBER_DATA_SEED_IDS.TIM,
    });

    const response =
      await makeGraphqlAPIRequestWithMemberRole(graphqlOperation);

    expect(response.body.data).toStrictEqual({ deleteWorkspaceMember: null });
    expect(response.body.errors).toBeDefined();
    expect(response.body.errors[0].message).toBe(
      'Please use /deleteUserFromWorkspace to remove a workspace member.',
    );
    expect(response.body.errors[0].extensions.code).toBe(
      ErrorCode.BAD_USER_INPUT,
    );
  });
});
