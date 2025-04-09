import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { gql } from '@apollo/client';
import { getMockPersonRecord } from '~/testing/mock-data/people';

export const query = gql`
  mutation DeleteManyPeople($filter: PersonFilterInput!) {
    deletePeople(filter: $filter) {
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
  getMockPersonRecord({ id: personId, deletedAt: null }, index),
);

export const variables = {
  filter: {
    id: {
      in: personIds,
    },
  },
};

export const responseData = personIds.map((personId) => ({ id: personId }));
