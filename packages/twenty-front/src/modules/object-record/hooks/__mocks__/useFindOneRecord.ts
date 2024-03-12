import { gql } from '@apollo/client';

import { responseData as person } from './useUpdateOneRecord';

export const query = gql`
  query FindOnePerson($objectRecordId: UUID!) {
    person(filter: { id: { eq: $objectRecordId } }) {
      __typename
          xLink {
            label
            url
          }
          id
          createdAt
          city
          email
          jobTitle
          name {
            firstName
            lastName
          }
          phone
          linkedinLink {
            label
            url
          }
          updatedAt
          avatarUrl
          companyId
    }
  }
`;

export const variables = {
  objectRecordId: '6205681e-7c11-40b4-9e32-f523dbe54590',
};

export const responseData = {
  ...person,
  id: '6205681e-7c11-40b4-9e32-f523dbe54590',
};
