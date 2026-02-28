import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { gql } from '@apollo/client';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';

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

const flatPersonRecords = mockedPersonRecords.map((record) =>
  getRecordFromRecordNode({ recordNode: record }),
);

export const personRecords = personIds.map<ObjectRecord>((personId, index) => ({
  ...flatPersonRecords[index],
  id: personId,
  deletedAt: null,
}));

export const variables = {
  filter: {
    id: {
      in: personIds,
    },
  },
};

export const responseData = personIds.map((personId) => ({ id: personId }));
