import { gql } from '@apollo/client';

export const UPDATE_ONE_COMPANY = gql`
  mutation UpdateOneCompany(
    $where: CompanyWhereUniqueInput!
    $data: CompanyUpdateInput!
  ) {
    updateOneCompany(data: $data, where: $where) {
      ...CompanyFieldsFragment
    }
  }
`;
