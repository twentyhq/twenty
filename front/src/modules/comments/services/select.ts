import { gql, useQuery } from '@apollo/client';

import {
  Company,
  CompanyWhereInput,
  Person,
  PersonWhereInput,
} from '../../../generated/graphql';

export const GET_COMPANY_COMMENT_COUNT = gql`
  query GetCompanyCounts($where: CompanyWhereInput) {
    companies: findManyCompany(where: $where) {
      commentsCount: _commentCount
    }
  }
`;

export const useCompanyCommentsCountQuery = (companyId: string) => {
  const whereCompany: CompanyWhereInput = { id: { equals: companyId } };
  const { data, ...rest } = useQuery<{
    companies: [{ commentsCount: Company['_commentCount'] }];
  }>(GET_COMPANY_COMMENT_COUNT, {
    variables: { where: whereCompany },
  });
  return { ...rest, data: data?.companies[0].commentsCount };
};

export const GET_PEOPLE_COMMENT_COUNT = gql`
  query GetPeopleCounts($where: PersonWhereInput) {
    people: findManyPerson(where: $where) {
      commentsCount: _commentCount
    }
  }
`;

export const usePeopleCommentsCountQuery = (personId: string) => {
  const wherePerson: PersonWhereInput = { id: { equals: personId } };
  const { data, ...rest } = useQuery<{
    people: [{ commentsCount: Person['_commentCount'] }];
  }>(GET_PEOPLE_COMMENT_COUNT, {
    variables: { where: wherePerson },
  });
  return { ...rest, data: data?.people[0].commentsCount };
};
