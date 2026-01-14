import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { type EachTestingContext } from 'twenty-shared/testing';
import {
  FieldMetadataType,
  RelationType,
  ViewSortDirection,
} from '~/generated-metadata/graphql';

const fields = [
  {
    name: 'name',
    updatedAt: '2021-01-01',
    createdAt: '2021-01-01',
    id: '20202020-18b3-4099-86e3-c46b2d5d42f2',
    type: FieldMetadataType.POSITION,
    label: 'label',
  },
];

const objectMetadataItemWithPositionField: ObjectMetadataItem = {
  id: 'object1',
  fields,
  readableFields: fields,
  updatableFields: fields,
  indexMetadatas: [],
  createdAt: '2021-01-01',
  updatedAt: '2021-01-01',
  nameSingular: 'object1',
  namePlural: 'object1s',
  labelIdentifierFieldMetadataId: '20202020-72ba-4e11-a36d-e17b544541e1',
  icon: 'icon',
  isActive: true,
  isSystem: false,
  isUIReadOnly: false,
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
          direction: ViewSortDirection.ASC,
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
          direction: ViewSortDirection.ASC,
        },
        {
          id: 'id',
          fieldMetadataId: 'field2',
          direction: ViewSortDirection.DESC,
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
          direction: ViewSortDirection.ASC,
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
          direction: ViewSortDirection.ASC,
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

  describe('relation field sorting', () => {
    const companyObjectMetadataItem: ObjectMetadataItem = {
      id: 'company-object-id',
      fields: [
        {
          id: 'company-name-field-id',
          name: 'name',
          type: FieldMetadataType.TEXT,
          label: 'Name',
          createdAt: '2021-01-01',
          updatedAt: '2021-01-01',
          isActive: true,
        } as FieldMetadataItem,
      ],
      readableFields: [],
      updatableFields: [],
      indexMetadatas: [],
      createdAt: '2021-01-01',
      updatedAt: '2021-01-01',
      nameSingular: 'company',
      namePlural: 'companies',
      labelIdentifierFieldMetadataId: 'company-name-field-id',
      icon: 'IconBuildingSkyscraper',
      isActive: true,
      isSystem: false,
      isUIReadOnly: false,
      isCustom: false,
      isRemote: false,
      isSearchable: false,
      labelPlural: 'Companies',
      labelSingular: 'Company',
      isLabelSyncedWithName: true,
    };

    const personObjectMetadataItem: ObjectMetadataItem = {
      id: 'person-object-id',
      fields: [
        {
          id: 'company-relation-field-id',
          name: 'company',
          type: FieldMetadataType.RELATION,
          label: 'Company',
          createdAt: '2021-01-01',
          updatedAt: '2021-01-01',
          isActive: true,
          relation: {
            type: RelationType.MANY_TO_ONE,
            targetObjectMetadata: {
              nameSingular: 'company',
            },
          },
        } as unknown as FieldMetadataItem,
        {
          id: 'position-field-id',
          name: 'position',
          type: FieldMetadataType.POSITION,
          label: 'Position',
          createdAt: '2021-01-01',
          updatedAt: '2021-01-01',
        } as FieldMetadataItem,
      ],
      readableFields: [],
      updatableFields: [],
      indexMetadatas: [],
      createdAt: '2021-01-01',
      updatedAt: '2021-01-01',
      nameSingular: 'person',
      namePlural: 'people',
      labelIdentifierFieldMetadataId: 'person-name-field-id',
      icon: 'IconUser',
      isActive: true,
      isSystem: false,
      isUIReadOnly: false,
      isCustom: false,
      isRemote: false,
      isSearchable: false,
      labelPlural: 'People',
      labelSingular: 'Person',
      isLabelSyncedWithName: true,
    };

    it('should sort by relation field using label identifier', () => {
      const sorts: RecordSort[] = [
        {
          id: 'sort-1',
          fieldMetadataId: 'company-relation-field-id',
          direction: ViewSortDirection.ASC,
        },
      ];

      const result = turnSortsIntoOrderBy(personObjectMetadataItem, sorts, [
        companyObjectMetadataItem,
      ]);

      // Should produce nested structure for GraphQL: { company: { name: 'AscNullsFirst' } }
      expect(result).toEqual([
        { company: { name: 'AscNullsFirst' } },
        { position: 'AscNullsFirst' },
      ]);
    });

    it('should sort by relation field descending', () => {
      const sorts: RecordSort[] = [
        {
          id: 'sort-1',
          fieldMetadataId: 'company-relation-field-id',
          direction: ViewSortDirection.DESC,
        },
      ];

      const result = turnSortsIntoOrderBy(personObjectMetadataItem, sorts, [
        companyObjectMetadataItem,
      ]);

      // Should produce nested structure for GraphQL: { company: { name: 'DescNullsLast' } }
      expect(result).toEqual([
        { company: { name: 'DescNullsLast' } },
        { position: 'AscNullsFirst' },
      ]);
    });

    it('should fallback to FK when related object not found', () => {
      const sorts: RecordSort[] = [
        {
          id: 'sort-1',
          fieldMetadataId: 'company-relation-field-id',
          direction: ViewSortDirection.ASC,
        },
      ];

      // Pass empty objectMetadataItems array - related object not found
      const result = turnSortsIntoOrderBy(personObjectMetadataItem, sorts, []);

      expect(result).toEqual([
        { companyId: 'AscNullsFirst' },
        { position: 'AscNullsFirst' },
      ]);
    });
  });
});
