import { gql } from '@apollo/client';

import { PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS } from '@/object-record/hooks/__mocks__/personFragments';
import { responseData as person } from './useUpdateOneRecord';

export const query = gql`
  query FindOnePerson($objectRecordId: UUID!) {
    person(filter: { id: { eq: $objectRecordId } }) {
      ${PERSON_FRAGMENT_WITH_DEPTH_ONE_RELATIONS}
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
