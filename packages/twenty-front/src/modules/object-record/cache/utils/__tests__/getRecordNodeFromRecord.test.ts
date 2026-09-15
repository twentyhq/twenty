import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

import { mockedPersonRecords } from '~/testing/mock-data/generated/data/people/mock-people-data';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const peopleMock = [...mockedPersonRecords];

describe('getRecordNodeFromRecord', () => {
  it('computes relation records cache references by default', () => {
    const objectMetadataItems: EnrichedObjectMetadataItem[] =
      getTestEnrichedObjectMetadataItemsMock();
    const objectMetadataItem:
      | Pick<
          EnrichedObjectMetadataItem,
          'fields' | 'namePlural' | 'nameSingular'
        >
      | undefined = getTestEnrichedObjectMetadataItemsMock().find(
      (item) => item.nameSingular === 'person',
    );

    if (!objectMetadataItem) {
      throw new Error('Object metadata item not found');
    }

    const recordGqlFields = {
      name: true,
      company: true,
    };
    const record = peopleMock[0];

    const result = getRecordNodeFromRecord({
      objectMetadataItems,
      objectMetadataItem,
      recordGqlFields,
      record,
    });

    expect(result).toEqual({
      __typename: 'Person',
      company: {
        __ref: `Company:${record.company.id}`,
      },
      name: {
        __typename: 'FullName',
        firstName: record.name.firstName,
        lastName: record.name.lastName,
      },
    });
  });

  it('does not compute relation records cache references when `computeReferences` is false', () => {
    const objectMetadataItems: EnrichedObjectMetadataItem[] =
      getTestEnrichedObjectMetadataItemsMock();
    const objectMetadataItem:
      | Pick<
          EnrichedObjectMetadataItem,
          'fields' | 'namePlural' | 'nameSingular'
        >
      | undefined = getTestEnrichedObjectMetadataItemsMock().find(
      (item) => item.nameSingular === 'person',
    );

    if (!objectMetadataItem) {
      throw new Error('Object metadata item not found');
    }

    const recordGqlFields = {
      name: true,
      company: true,
    };
    const record = peopleMock[0];
    const computeReferences = false;

    const result = getRecordNodeFromRecord({
      objectMetadataItems,
      objectMetadataItem,
      recordGqlFields,
      record,
      computeReferences,
    });

    expect(result).toEqual({
      __typename: 'Person',
      company: record.company,
      name: {
        __typename: 'FullName',
        firstName: record.name.firstName,
        lastName: record.name.lastName,
      },
    });
  });

  it('skips a to-many relation whose value is null instead of crashing', () => {
    const objectMetadataItems: EnrichedObjectMetadataItem[] =
      getTestEnrichedObjectMetadataItemsMock();
    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    );

    if (!objectMetadataItem) {
      throw new Error('Object metadata item not found');
    }

    const oneToManyRelationField = objectMetadataItem.fields.find(
      (field) =>
        field.type === FieldMetadataType.RELATION &&
        field.relation?.type === RelationType.ONE_TO_MANY,
    );

    if (!oneToManyRelationField) {
      throw new Error('No to-many relation field found on person');
    }

    const record = {
      ...peopleMock[0],
      [oneToManyRelationField.name]: null,
    };
    const recordGqlFields = {
      name: true,
      [oneToManyRelationField.name]: true,
    };

    // When / Then
    expect(() =>
      getRecordNodeFromRecord({
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields,
        record,
      }),
    ).not.toThrow();

    const result = getRecordNodeFromRecord({
      objectMetadataItems,
      objectMetadataItem,
      recordGqlFields,
      record,
    });

    expect(result).not.toHaveProperty(oneToManyRelationField.name);
  });
});
