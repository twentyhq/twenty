import { gql } from '@apollo/client';

export const GET_LMS_DATA = gql`
  query GetLmsData {
    lmsData {
      id
    }
  }
`;

export const CREATE_LMS_ITEM = gql`
  mutation CreateLmsItem($input: LmsInput!) {
    createLmsItem(input: $input) {
      id
    }
  }
`;

export const GET_LMS_ANALYTICS = gql`
  query GetLmsAnalytics {
    lmsAnalytics {
      totalCount
      activeCount
    }
  }
`;
