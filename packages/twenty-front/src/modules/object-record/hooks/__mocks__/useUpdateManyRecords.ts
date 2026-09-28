import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { gql } from '@apollo/client';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';

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

const flatPersonRecords = mockedPersonRecords.map((record) =>
  getRecordFromRecordNode({ recordNode: record }),
);

const getFlatPersonRecordOrThrow = (index: number) => {
  const flatPersonRecord = flatPersonRecords[index];
  assertIsDefinedOrThrow(flatPersonRecord);

  return flatPersonRecord;
};

export const personRecords = personIds.map<ObjectRecord>((personId, index) => ({
  ...getFlatPersonRecordOrThrow(index),
  id: personId,
}));

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
  (personId, index) => ({
    ...getFlatPersonRecordOrThrow(index),
    id: personId,
    city: 'Updated City',
  }),
);

export const responseData = personIds.map((personId) => ({ id: personId }));
