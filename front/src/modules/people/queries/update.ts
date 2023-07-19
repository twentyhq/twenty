import { gql } from '@apollo/client';

export const UPDATE_PERSON = gql`
  mutation UpdatePeople(
    $id: String
    $firstName: String
    $lastName: String
    $phone: String
    $city: String
    $companyId: String
    $email: String
    $createdAt: DateTime
  ) {
    updateOnePerson(
      where: { id: $id }
      data: {
        city: $city
        company: { connect: { id: $companyId } }
        email: $email
        firstName: $firstName
        id: $id
        lastName: $lastName
        phone: $phone
        createdAt: $createdAt
      }
    ) {
      id
      city
      company {
        domainName
        name
        id
      }
      email
      firstName
      lastName
      phone
      createdAt
    }
  }
`;

export const INSERT_PERSON = gql`
  mutation InsertPerson(
    $id: String!
    $firstName: String!
    $lastName: String!
    $phone: String!
    $city: String!
    $email: String!
    $createdAt: DateTime
  ) {
    createOnePerson(
      data: {
        id: $id
        firstName: $firstName
        lastName: $lastName
        phone: $phone
        city: $city
        email: $email
        createdAt: $createdAt
      }
    ) {
      id
      city
      company {
        domainName
        name
        id
      }
      email
      firstName
      lastName
      phone
      createdAt
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
