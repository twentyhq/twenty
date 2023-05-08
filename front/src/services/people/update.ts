import { FetchResult, gql } from '@apollo/client';
import { Person, mapGqlPerson } from '../../interfaces/person.interface';
import { apiClient } from '../../apollo';

export const UPDATE_PERSON = gql`
  mutation UpdatePeople(
    $id: uuid
    $firstname: String
    $lastname: String
    $phone: String
    $city: String
    $company_id: uuid
    $email: String
    $created_at: timestamptz
  ) {
    update_people(
      where: { id: { _eq: $id } }
      _set: {
        city: $city
        company_id: $company_id
        email: $email
        firstname: $firstname
        id: $id
        lastname: $lastname
        phone: $phone
        created_at: $created_at
      }
    ) {
      returning {
        city
        company {
          domain_name
          name
          id
        }
        email
        firstname
        id
        lastname
        phone
        created_at
      }
    }
  }
`;

export const INSERT_PERSON = gql`
  mutation InsertPerson(
    $id: uuid
    $firstname: String
    $lastname: String
    $phone: String
    $city: String
    $company_id: uuid
    $email: String
    $created_at: timestamptz
  ) {
    insert_people(
      objects: {
        id: $id
        firstname: $firstname
        lastname: $lastname
        phone: $phone
        city: $city
        company_id: $company_id
        email: $email
        created_at: $created_at
      }
    ) {
      affected_rows
      returning {
        city
        company {
          domain_name
          name
          id
        }
        email
        firstname
        id
        lastname
        phone
        created_at
      }
    }
  }
`;

export const DELETE_PEOPLE = gql`
  mutation DeletePeople($ids: [uuid]) {
    delete_people(where: { id: { _in: $ids } }) {
      returning {
        city
        company {
          domain_name
          name
          id
        }
        email
        firstname
        id
        lastname
        phone
        created_at
      }
    }
  }
`;

export async function updatePerson(
  person: Person,
): Promise<FetchResult<Person>> {
  const result = await apiClient.mutate({
    mutation: UPDATE_PERSON,
    variables: mapGqlPerson(person),
  });
  return result;
}

export async function insertPerson(
  person: Person,
): Promise<FetchResult<Person>> {
  const result = await apiClient.mutate({
    mutation: INSERT_PERSON,
    variables: mapGqlPerson(person),
  });

  return result;
}

export async function deletePeople(
  peopleIds: string[],
): Promise<FetchResult<Person>> {
  const result = await apiClient.mutate({
    mutation: DELETE_PEOPLE,
    variables: { ids: peopleIds },
  });

  return result;
}
