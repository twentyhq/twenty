import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';
import { RecordSort } from '@/object-record/record-sort/types/RecordSort';

const sortDefinition: SortDefinition = {
  fieldMetadataId: 'id',
  label: 'definition label',
  iconName: 'icon',
};

const objectMetadataItem: ObjectMetadataItem = {
  id: 'object1',
  fields: [],
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

describe('turnSortsIntoOrderBy', () => {
  it('should sort by recordPosition if no sorts', () => {
    const fields = [{ id: 'field1', name: 'createdAt' }] as FieldMetadataItem[];
    expect(turnSortsIntoOrderBy({ ...objectMetadataItem, fields }, [])).toEqual(
      [
        {
          position: 'AscNullsFirst',
        },
      ],
    );
  });

  it('should create OrderByField with single sort', () => {
    const sorts: RecordSort[] = [
      {
        id: 'id',
        fieldMetadataId: 'field1',
        direction: 'asc',
        definition: sortDefinition,
      },
    ];
    const fields = [{ id: 'field1', name: 'field1' }] as FieldMetadataItem[];
    expect(
      turnSortsIntoOrderBy({ ...objectMetadataItem, fields }, sorts),
    ).toEqual([{ field1: 'AscNullsFirst' }, { position: 'AscNullsFirst' }]);
  });

  it('should create OrderByField with multiple sorts', () => {
    const sorts: RecordSort[] = [
      {
        id: 'id',
        fieldMetadataId: 'field1',
        direction: 'asc',
        definition: sortDefinition,
      },
      {
        id: 'id',
        fieldMetadataId: 'field2',
        direction: 'desc',
        definition: sortDefinition,
      },
    ];
    const fields = [
      { id: 'field1', name: 'field1' },
      { id: 'field2', name: 'field2' },
    ] as FieldMetadataItem[];
    expect(
      turnSortsIntoOrderBy({ ...objectMetadataItem, fields }, sorts),
    ).toEqual([
      { field1: 'AscNullsFirst' },
      { field2: 'DescNullsLast' },
      { position: 'AscNullsFirst' },
    ]);
  });

  it('should ignore if field not found', () => {
    const sorts: RecordSort[] = [
      {
        id: 'id',
        fieldMetadataId: 'invalidField',
        direction: 'asc',
        definition: sortDefinition,
      },
    ];
    expect(turnSortsIntoOrderBy(objectMetadataItem, sorts)).toEqual([
      { position: 'AscNullsFirst' },
    ]);
  });

  it('should not return position for remotes', () => {
    const sorts: RecordSort[] = [
      {
        id: 'id',
        fieldMetadataId: 'invalidField',
        direction: 'asc',
        definition: sortDefinition,
      },
    ];
    expect(
      turnSortsIntoOrderBy({ ...objectMetadataItem, isRemote: true }, sorts),
    ).toEqual([]);
  });
});
