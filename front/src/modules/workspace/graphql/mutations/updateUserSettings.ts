import { gql } from '@apollo/client';

export const UPDATE_USER_SETTINGS = gql`
  mutation UpdateUserSettings(
    $data: UserSettingsUpdateInput!
    $where: UserSettingsWhereUniqueInput!
  ) {
    updateUserSettings(data: $data, where: $where) {
      id
      locale
      colorScheme
    }
  }
`;
