import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { RecordGqlOperationOrderBy } from '@/object-record/graphql/types/RecordGqlOperationOrderBy';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { EachTestingContext } from 'twenty-shared/testing';

const objectMetadataItemWithPositionField: ObjectMetadataItem = {
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
  isSearchable: false,
  labelPlural: 'object1s',
  labelSingular: 'object1',
  isLabelSyncedWithName: true,
};

type PartialFieldMetadaItemWithRequiredId = Pick<FieldMetadataItem, 'id'> &
  Partial<Omit<FieldMetadataItem, 'id'>>;
const getMockFieldMetadataItem = (
  overrides: PartialFieldMetadaItemWithRequiredId,
): FieldMetadataItem => ({
  name: 'name',
  updatedAt: '2021-01-01',
  createdAt: '2021-01-01',
  type: FieldMetadataType.TEXT,
  label: 'label',
  ...overrides,
});

type TurnSortsIntoOrderTestContext = EachTestingContext<{
  fields: PartialFieldMetadaItemWithRequiredId[];
  expected: RecordGqlOperationOrderBy;
  sort: RecordSort[];
  objectMetadataItemOverrides?: Partial<Omit<ObjectMetadataItem, 'fields'>>;
}>;

const turnSortsIntoOrderByTestUseCases: TurnSortsIntoOrderTestContext[] = [
  {
    title: 'It should sort by recordPosition if no sorts',
    context: {
      fields: [{ id: 'field1', name: 'field1' }],
      sort: [],
      expected: [
        {
          position: 'AscNullsFirst',
        },
      ],
    },
  },
  {
    title: 'It should create OrderByField with single sort',
    context: {
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
  },
  {
    title: 'It should create OrderByField with multiple sorts',
    context: {
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
  },
  {
    title: 'It should ignore if field not found',
    context: {
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
  },
  {
    title: 'It should not return position for remotes',
    context: {
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
  },
];

describe('turnSortsIntoOrderBy', () => {
  it.each<TurnSortsIntoOrderTestContext>(turnSortsIntoOrderByTestUseCases)(
    '.$title',
    ({ context: { fields, sort, expected, objectMetadataItemOverrides } }) => {
      const newFields = fields.map(getMockFieldMetadataItem);
      const objectMetadataItemWithNewFields = {
        ...objectMetadataItemWithPositionField,
        ...objectMetadataItemOverrides,
        fields: [...objectMetadataItemWithPositionField.fields, ...newFields],
      };

      expect(
        turnSortsIntoOrderBy(objectMetadataItemWithNewFields, sort),
      ).toEqual(expected);
    },
  );
});
