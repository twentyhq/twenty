import { gql } from '@apollo/client';

import {
  useGetCompanyCommentsCountQuery,
  useGetPeopleCommentsCountQuery,
} from '../../../generated/graphql';

export const GET_COMPANY_COMMENT_COUNT = gql`
  query GetCompanyCommentsCount($where: CompanyWhereInput) {
    companies: findManyCompany(where: $where) {
      commentsCount: _commentCount
    }
  }
`;

export const useCompanyCommentsCountQuery = (companyId: string) => {
  const { data, ...rest } = useGetCompanyCommentsCountQuery({
    variables: { where: { id: { equals: companyId } } },
  });
  return { ...rest, data: data?.companies[0].commentsCount };
};

export const GET_PEOPLE_COMMENT_COUNT = gql`
  query GetPeopleCommentsCount($where: PersonWhereInput) {
    people: findManyPerson(where: $where) {
      commentsCount: _commentCount
    }
  }
`;

export const usePeopleCommentsCountQuery = (personId: string) => {
  const { data, ...rest } = useGetPeopleCommentsCountQuery({
    variables: { where: { id: { equals: personId } } },
  });
  return { ...rest, data: data?.people[0].commentsCount };
};

export const GET_COMMENT_THREADS_BY_TARGETS = gql`
  query GetCommentThreadsByTargets($commentThreadTargetIds: [String!]!) {
    findManyCommentThreads(
      where: {
        commentThreadTargets: {
          some: { commentableId: { in: $commentThreadTargetIds } }
        }
      }
    ) {
      id
      comments {
        id
        body
        createdAt
        updatedAt
        author {
          id
          displayName
          avatarUrl
        }
      }
    }
  }
`;

export const GET_COMMENT_THREAD = gql`
  query GetCommentThread($commentThreadId: String!) {
    findManyCommentThreads(where: { id: { equals: $commentThreadId } }) {
      id
      comments {
        id
        body
        createdAt
        updatedAt
        author {
          id
          displayName
          avatarUrl
        }
      }
    }
  }
`;
