import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { gql } from '@apollo/client';
import { getMockPersonRecord } from '~/testing/mock-data/people';

export const query = gql`
  mutation UpdateManyPeople(
    $filter: PersonFilterInput!
    $data: PersonUpdateInput!
  ) {
    updatePeople(filter: $filter, data: $data) {
      id
      __typename
    }
  }
`;

export const personIds = [
  'a7286b9a-c039-4a89-9567-2dfa7953cda9',
  '37faabcd-cb39-4a0a-8618-7e3fda9afca0',
];

export const personRecords = personIds.map<ObjectRecord>((personId, index) =>
  getMockPersonRecord({ id: personId }, index),
);

export const updateInput = {
  city: 'Updated City',
};

export const variables = {
  filter: {
    id: {
      in: personIds,
    },
  },
  data: updateInput,
};

export const updatedPersonRecords = personIds.map<ObjectRecord>(
  (personId, index) =>
    getMockPersonRecord({ id: personId, city: 'Updated City' }, index),
);

export const responseData = personIds.map((personId) => ({ id: personId }));
