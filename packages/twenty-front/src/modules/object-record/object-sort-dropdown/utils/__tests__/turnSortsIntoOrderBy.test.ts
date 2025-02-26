import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { v4 } from 'uuid';
import { FieldMetadataType } from '~/generated-metadata/graphql';

const objectMetadataItemWithPosition: ObjectMetadataItem = {
  id: 'object1',
  fields: [
    {
      name: 'name',
      updatedAt: '2021-01-01',
      createdAt: '2021-01-01',
      id: '20202020-18b3-4099-86e3-c46b2d5d42f2',
      type: FieldMetadataType.POSITION,
      label: 'label',
    },
  ],
  indexMetadatas: [],
  createdAt: '2021-01-01',
  updatedAt: '2021-01-01',
  nameSingular: 'object1',
  namePlural: 'object1s',
  labelIdentifierFieldMetadataId: '20202020-72ba-4e11-a36d-e17b544541e1',
  icon: 'icon',
  isActive: true,
  isSystem: false,
  isCustom: false,
  isRemote: false,
  labelPlural: 'object1s',
  labelSingular: 'object1',
  isLabelSyncedWithName: true,
};

const getMockFieldMetadataItem = (
  overrides: Partial<FieldMetadataItem>,
): FieldMetadataItem => ({
  name: 'name',
  updatedAt: '2021-01-01',
  createdAt: '2021-01-01',
  id: `20202020-${v4().split('-').slice(1).join('-')}`,
  type: FieldMetadataType.TEXT,
  label: 'label',
  ...overrides,
});

describe('turnSortsIntoOrderBy', () => {
  it.each<{
    title: string;
    fields: Partial<FieldMetadataItem>[];
    expected: RecordGqlOperationOrderBy;
    sort: RecordSort[];
    objectMetadataItemOverrides?: Partial<Omit<ObjectMetadataItem, 'fields'>>;
  }>([
    {
      title: 'It should sort by recordPosition if no sorts',
      fields: [{ id: 'field1', name: 'field1' }],
      sort: [],
      expected: [
        {
          position: 'AscNullsFirst',
        },
      ],
    },
    {
      title: 'It should create OrderByField with single sort',
      fields: [{ id: 'field1', name: 'field1' }],
      sort: [
        {
          id: 'id',
          fieldMetadataId: 'field1',
          direction: 'asc',
        },
      ],
      expected: [{ field1: 'AscNullsFirst' }, { position: 'AscNullsFirst' }],
    },
    {
      title: 'It should create OrderByField with multiple sorts',
      fields: [
        { id: 'field1', name: 'field1' },
        { id: 'field2', name: 'field2' },
      ],
      sort: [
        {
          id: 'id',
          fieldMetadataId: 'field1',
          direction: 'asc',
        },
        {
          id: 'id',
          fieldMetadataId: 'field2',
          direction: 'desc',
        },
      ],
      expected: [
        { field1: 'AscNullsFirst' },
        { field2: 'DescNullsLast' },
        { position: 'AscNullsFirst' },
      ],
    },
    {
      title: 'It should ignore if field not found',
      fields: [],
      sort: [
        {
          id: 'id',
          fieldMetadataId: 'invalidField',
          direction: 'asc',
        },
      ],
      expected: [{ position: 'AscNullsFirst' }],
    },
    {
      title: 'It should not return position for remotes',
      fields: [],
      sort: [
        {
          id: 'id',
          fieldMetadataId: 'invalidField',
          direction: 'asc',
        },
      ],
      expected: [],
      objectMetadataItemOverrides: {
        isRemote: true,
      },
    },
  ])('.$title', ({ fields, sort, expected, objectMetadataItemOverrides }) => {
    const newFields = fields.map(getMockFieldMetadataItem);
    const objectMetadataItemWithNewFields = {
      ...objectMetadataItemWithPosition,
      ...objectMetadataItemOverrides,
      fields: [...objectMetadataItemWithPosition.fields, ...newFields],
    };

    expect(turnSortsIntoOrderBy(objectMetadataItemWithNewFields, sort)).toEqual(
      expected,
    );
  });
});
