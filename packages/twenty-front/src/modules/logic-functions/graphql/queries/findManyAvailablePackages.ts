import { gql } from '@apollo/client';

export const FIND_MANY_AVAILABLE_PACKAGES = gql`
  query FindManyAvailablePackages($input: LogicFunctionIdInput!) {
    getAvailablePackages(input: $input)
  }
`;
