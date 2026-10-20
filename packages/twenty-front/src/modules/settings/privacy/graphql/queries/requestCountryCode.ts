import { gql } from '@apollo/client';

export const REQUEST_COUNTRY_CODE = gql`
  query RequestCountryCode {
    requestCountryCode
  }
`;
