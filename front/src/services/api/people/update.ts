import { FetchResult, gql } from '@apollo/client';
import {
  Person,
  mapToGqlPerson,
} from '../../../interfaces/entities/person.interface';
import { apiClient } from '../../../apollo';

export const UPDATE_PERSON = gql`
  mutation UpdatePeople(
    $id: String
    $firstname: String
    $lastname: String
    $phone: String
    $city: String
    $company_id: String
    $email: String
    $created_at: DateTime
  ) {
    updateOnePerson(
      where: { id: $id }
      data: {
        city: { set: $city }
        company: { connect: { id: $company_id } }
        email: { set: $email }
        firstname: { set: $firstname }
        id: { set: $id }
        lastname: { set: $lastname }
        phone: { set: $phone }
        createdAt: { set: $created_at }
      }
    ) {
      city
      company {
        domain_name: domainName
        name
        id
      }
      email
      firstname
      id
      lastname
      phone
      created_at: createdAt
    }
  }
`;

export const INSERT_PERSON = gql`
  mutation InsertPerson(
    $id: String!
    $firstname: String!
    $lastname: String!
    $phone: String!
    $city: String!
    $company_id: String
    $email: String!
    $created_at: DateTime
  ) {
    createOnePerson(
      data: {
        id: $id
        firstname: $firstname
        lastname: $lastname
        phone: $phone
        city: $city
        company: { connect: { id: $company_id } }
        email: $email
        createdAt: $created_at
        workspace: { connect: { id: "il faut rajouter l'id du workspace" } }
      }
    ) {
      city
      company {
        domain_name: domainName
        name
        id
      }
      email
      firstname
      id
      lastname
      phone
      created_at: createdAt
    }
  }
`;

export const DELETE_PEOPLE = gql`
  mutation DeletePeople($ids: [String!]) {
    deleteManyPerson(where: { id: { in: $ids } }) {
      count
    }
  }
`;

export async function updatePerson(
  person: Person,
): Promise<FetchResult<Person>> {
  const result = await apiClient.mutate({
    mutation: UPDATE_PERSON,
    variables: mapToGqlPerson(person),

    // TODO: use a mapper?
    optimisticResponse: {
      __typename: 'people' as const,
      id: person.id,
      update_people: {
        returning: {
          id: person.id,
          city: 'TEST',
          company: {
            domain_name: person.company?.domainName,
            name: person.company?.name,
            id: person.company?.id,
          },
          email: person.email,
          firstname: person.firstname,
          lastname: person.lastname,
          phone: person.phone,
          created_at: person.creationDate,

          //   city
          // company {
          //   domain_name
          //   name
          //   id
          // }
          // email
          // firstname
          // id
          // lastname
          // phone
          // created_at
        },
      },
    },
  });
  return result;
}

export async function insertPerson(
  person: Person,
): Promise<FetchResult<Person>> {
  const result = await apiClient.mutate({
    mutation: INSERT_PERSON,
    variables: mapToGqlPerson(person),
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
