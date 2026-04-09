import gql from 'graphql-tag';

export type UpdateWorkspaceMemberRoleInput = {
  workspaceMemberId: string;
  roleId: string;
};

const DEFAULT_WORKSPACE_MEMBER_GQL_FIELDS = `
  id
  name {
    firstName
    lastName
  }
  userEmail
  roles {
    id
    label
    icon
  }
`;

export const updateWorkspaceMemberRoleQueryFactory = ({
  input,
  gqlFields = DEFAULT_WORKSPACE_MEMBER_GQL_FIELDS,
}: {
  input: UpdateWorkspaceMemberRoleInput;
  gqlFields?: string;
}) => ({
  query: gql`
    mutation UpdateWorkspaceMemberRole($workspaceMemberId: UUID!, $roleId: UUID!) {
      updateWorkspaceMemberRole(
        workspaceMemberId: $workspaceMemberId
        roleId: $roleId
      ) {
        ${gqlFields}
      }
    }
  `,
  variables: {
    workspaceMemberId: input.workspaceMemberId,
    roleId: input.roleId,
  },
});
