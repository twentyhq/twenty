import { gql } from '@apollo/client';

import { PERSON_FRAGMENT } from '@/object-record/hooks/__mocks__/personFragment';
import { responseData as person } from './useUpdateOneRecord';

export const query = gql`
  query FindOnePerson($objectRecordId: ID!) {
    person(filter: { id: { eq: $objectRecordId } }) {
      ${PERSON_FRAGMENT}
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
