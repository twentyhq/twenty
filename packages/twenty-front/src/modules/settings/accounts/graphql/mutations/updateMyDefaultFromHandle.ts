import { gql } from '@apollo/client';

export const UPDATE_MY_DEFAULT_FROM_HANDLE = gql`
  mutation UpdateMyDefaultFromHandle($input: UpdateMyDefaultFromHandleInput!) {
    updateMyDefaultFromHandle(input: $input)
  }
`;
