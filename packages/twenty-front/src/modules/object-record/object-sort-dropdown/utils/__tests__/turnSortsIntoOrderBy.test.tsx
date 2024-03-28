import { Sort } from '@/object-record/object-sort-dropdown/types/Sort';
import { SortDefinition } from '@/object-record/object-sort-dropdown/types/SortDefinition';
import { turnSortsIntoOrderBy } from '@/object-record/object-sort-dropdown/utils/turnSortsIntoOrderBy';

const sortDefinition: SortDefinition = {
  fieldMetadataId: 'id',
  label: 'definition label',
  iconName: 'icon',
};

describe('turnSortsIntoOrderBy', () => {
  it('should sort by recordPosition if no sorts', () => {
    const fields = [{ id: 'field1', name: 'createdAt' }];
    expect(turnSortsIntoOrderBy([], fields)).toEqual({
      position: 'AscNullsFirst',
    });
  });

  it('should create OrderByField with single sort', () => {
    const sorts: Sort[] = [
      {
        fieldMetadataId: 'field1',
        direction: 'asc',
        definition: sortDefinition,
      },
    ];
    const fields = [{ id: 'field1', name: 'field1' }];
    expect(turnSortsIntoOrderBy(sorts, fields)).toEqual({
      field1: 'AscNullsFirst',
      position: 'AscNullsFirst',
    });
  });

  it('should create OrderByField with multiple sorts', () => {
    const sorts: Sort[] = [
      {
        fieldMetadataId: 'field1',
        direction: 'asc',
        definition: sortDefinition,
      },
      {
        fieldMetadataId: 'field2',
        direction: 'desc',
        definition: sortDefinition,
      },
    ];
    const fields = [
      { id: 'field1', name: 'field1' },
      { id: 'field2', name: 'field2' },
    ];
    expect(turnSortsIntoOrderBy(sorts, fields)).toEqual({
      field1: 'AscNullsFirst',
      field2: 'DescNullsLast',
      position: 'AscNullsFirst',
    });
  });

  it('should ignore if field not found', () => {
    const sorts: Sort[] = [
      {
        fieldMetadataId: 'invalidField',
        direction: 'asc',
        definition: sortDefinition,
      },
    ];
    expect(turnSortsIntoOrderBy(sorts, [])).toEqual({
      position: 'AscNullsFirst',
    });
  });
});
