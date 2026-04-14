import { gql } from '@apollo/client';

export const USER_INFO_FRAGMENT = gql`
  fragment UserInfoFragment on UserInfo {
    id
    email
    firstName
    lastName
    createdAt
  }
`;
