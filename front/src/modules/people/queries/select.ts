import { gql } from '@apollo/client';

import { CommentableEntityForSelect } from '@/activities/types/CommentableEntityForSelect';
import { useFilteredSearchEntityQuery } from '@/search/hooks/useFilteredSearchEntityQuery';
import { SelectedSortType } from '@/ui/filter-n-sort/types/interface';
import {
  CommentableType,
  PersonOrderByWithRelationInput as People_Order_By,
  PersonWhereInput as People_Bool_Exp,
  SortOrder,
  useGetPeopleQuery,
  useSearchPeopleQuery,
} from '~/generated/graphql';

export type PeopleSelectedSortType = SelectedSortType<People_Order_By>;

export const GET_PEOPLE = gql`
  query GetPeople(
    $orderBy: [PersonOrderByWithRelationInput!]
    $where: PersonWhereInput
    $limit: Int
  ) {
    people: findManyPerson(orderBy: $orderBy, where: $where, take: $limit) {
      id
      phone
      email
      city
      firstName
      lastName
      displayName
      jobTitle
      linkedinUrl
      xUrl
      avatarUrl
      createdAt
      _activityCount
      company {
        id
        name
        domainName
      }
    }
  }
`;

export function usePeopleQuery(
  orderBy: People_Order_By[],
  where: People_Bool_Exp,
) {
  return useGetPeopleQuery({
    variables: { orderBy, where },
  });
}

export function useFilteredSearchPeopleQuery({
  searchFilter,
  selectedIds = [],
  limit,
}: {
  searchFilter: string;
  selectedIds?: string[];
  limit?: number;
}) {
  return useFilteredSearchEntityQuery({
    queryHook: useSearchPeopleQuery,
    searchOnFields: ['firstName', 'lastName'],
    orderByField: 'lastName',
    selectedIds: selectedIds,
    mappingFunction: (entity) =>
      ({
        id: entity.id,
        entityType: CommentableType.Person,
        name: `${entity.firstName} ${entity.lastName}`,
        avatarUrl: entity.avatarUrl,
        avatarType: 'rounded',
      } as CommentableEntityForSelect),
    searchFilter,
    limit,
  });
}

export const defaultOrderBy: People_Order_By[] = [
  {
    createdAt: SortOrder.Desc,
  },
];

export const GET_PERSON_PHONE = gql`
  query GetPersonPhoneById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      phone
    }
  }
`;

export const GET_PERSON_EMAIL = gql`
  query GetPersonEmailById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      email
    }
  }
`;

export const GET_PERSON_NAMES_AND_COMMENT_COUNT = gql`
  query GetPersonNamesAndCommentCountById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      firstName
      lastName
      displayName
      _activityCount
    }
  }
`;

export const GET_PERSON_COMPANY = gql`
  query GetPersonCompanyById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      company {
        id
        name
        domainName
      }
    }
  }
`;

export const GET_PERSON_COMMENT_COUNT = gql`
  query GetPersonCommentCountById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      _activityCount
    }
  }
`;

export const GET_PERSON_CREATED_AT = gql`
  query GetPersonCreatedAtById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      createdAt
    }
  }
`;

export const GET_PERSON_CITY = gql`
  query GetPersonCityById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      city
    }
  }
`;
