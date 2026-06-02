import { gql } from '@apollo/client';

export const UPDATE_WORKSPACE_MEMBER_SETTINGS = gql`
  mutation UpdateWorkspaceMemberSettings(
    $input: UpdateWorkspaceMemberSettingsInput!
  ) {
    updateWorkspaceMemberSettings(input: $input)
  }
`;
