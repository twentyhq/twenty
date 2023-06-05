import { gql, useQuery } from '@apollo/client';

import { Company, CompanyWhereInput } from '../../../generated/graphql';

export const GET_COMPANY_COMMENT_COUNT = gql`
  query GetCompanyCounts($where: CompanyWhereInput) {
    companies: findManyCompany(where: $where) {
      commentsCount: _commentsCount
    }
  }
`;

export const useCompanyCommentsCountQuery = (companyId: string) => {
  const whereCompany: CompanyWhereInput = { id: { equals: companyId } };
  const { data, ...rest } = useQuery<{
    companies: [{ commentsCount: Company['_commentsCount'] }];
  }>(GET_COMPANY_COMMENT_COUNT, {
    variables: { where: whereCompany },
  });
  return { ...rest, data: data?.companies[0].commentsCount };
};
