import { gql } from '@apollo/client';

export const UPDATE_PERSON = gql`
  mutation UpdatePeople(
    $id: String
    $firstname: String
    $lastname: String
    $phone: String
    $city: String
    $companyId: String
    $email: String
    $createdAt: DateTime
  ) {
    updateOnePerson(
      where: { id: $id }
      data: {
        city: { set: $city }
        company: { connect: { id: $companyId } }
        email: { set: $email }
        firstname: { set: $firstname }
        id: { set: $id }
        lastname: { set: $lastname }
        phone: { set: $phone }
        createdAt: { set: $createdAt }
      }
    ) {
      city
      company {
        domainName
        name
        id
      }
      email
      firstname
      id
      lastname
      phone
      createdAt
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
    $email: String!
    $createdAt: DateTime
  ) {
    createOnePerson(
      data: {
        id: $id
        firstname: $firstname
        lastname: $lastname
        phone: $phone
        city: $city
        email: $email
        createdAt: $createdAt
      }
    ) {
      city
      company {
        domainName
        name
        id
      }
      email
      firstname
      id
      lastname
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
