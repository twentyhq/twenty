import { gql } from '@apollo/client';

export const GET_ROLES_READING_ALL_CHANNEL_RECORDS = gql`
  query RolesReadingAllChannelRecords {
    rolesReadingAllMessages {
      isAdminRoleIncluded
      otherRoleCount
    }
    rolesReadingAllCalendarEvents {
      isAdminRoleIncluded
      otherRoleCount
    }
  }
`;
