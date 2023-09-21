import { gql } from '@apollo/client';

import { COMPANY_FIELDS_FRAGMENT } from '../fragments/companyFieldsFragment';

export const GET_COMPANIES = gql`
  ${COMPANY_FIELDS_FRAGMENT}
  query GetCompanies(
    $orderBy: [CompanyOrderByWithRelationInput!]
    $where: CompanyWhereInput
  ) {
    companies: findManyCompany(orderBy: $orderBy, where: $where) {
      ...companyFieldsFragment
    }
  }
`;
