import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { type FieldMetadataType } from 'twenty-shared/types';
import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

// Server-fetched records in raw GraphQL node format (relations are connections)
const rawPersonRecords = mockedPersonRecords as ObjectRecord[];

// Flattened records suitable for cache population (relations are flat arrays)
const flatPersonRecords = rawPersonRecords.map((record) =>
  getRecordFromRecordNode({ recordNode: record }),
);

export const getPeopleRecordConnectionMock = () => {
  return [...rawPersonRecords];
};

export const getMockPersonObjectMetadataItem = () => {
  return getMockObjectMetadataItemOrThrow('person');
};

export const getMockPersonFieldMetadataItem = (
  fieldMetadataType: FieldMetadataType,
  objectMetadataItem = getMockPersonObjectMetadataItem(),
) => {
  const result = objectMetadataItem.fields.find(
    (field) => field.type === fieldMetadataType,
  );
  if (!result) {
    throw new Error(
      `Person fieldmetadata item type ${fieldMetadataType} not found`,
    );
  }

  return result;
};

export const getMockPersonRecord = (
  overrides?: Partial<ObjectRecord>,
  index = 0,
) => {
  return {
    ...flatPersonRecords[index],
    ...overrides,
  };
};

export const allMockPersonRecords = flatPersonRecords;
