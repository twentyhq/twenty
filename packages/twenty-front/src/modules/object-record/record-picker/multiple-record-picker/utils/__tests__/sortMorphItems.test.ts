import { type RecordPickerPickableMorphItem } from '@/object-record/record-picker/types/RecordPickerPickableMorphItem';
import { type SearchRecord } from '~/generated-metadata/graphql';
import { sortMorphItems } from '@/object-record/record-picker/multiple-record-picker/utils/sortMorphItems';

const createMorphItem = (
  recordId: string,
  isSelected: boolean,
): RecordPickerPickableMorphItem => ({
  recordId,
  objectMetadataId: 'object-1',
  isSelected,
  isMatchingSearchFilter: true,
});

const createSearchRecord = (recordId: string): SearchRecord => ({
  recordId,
  label: `Record ${recordId}`,
  objectNameSingular: 'person',
  tsRank: 0,
  tsRankCD: 0,
});

describe('sortMorphItems', () => {
  it('should sort selected items before non-selected items', () => {
    const morphItems: RecordPickerPickableMorphItem[] = [
      createMorphItem('1', false),
      createMorphItem('2', true),
      createMorphItem('3', false),
    ];
    const searchRecords: SearchRecord[] = [
      createSearchRecord('1'),
      createSearchRecord('2'),
      createSearchRecord('3'),
    ];

    const result = sortMorphItems(morphItems, searchRecords);

    expect(result[0].recordId).toBe('2');
    expect(result[0].isSelected).toBe(true);
    expect(result[1].isSelected).toBe(false);
    expect(result[2].isSelected).toBe(false);
  });

  it('should sort by search record order within non-selected items', () => {
    const morphItems: RecordPickerPickableMorphItem[] = [
      createMorphItem('3', false),
      createMorphItem('1', false),
      createMorphItem('2', false),
    ];
    const searchRecords: SearchRecord[] = [
      createSearchRecord('1'),
      createSearchRecord('2'),
      createSearchRecord('3'),
    ];

    const result = sortMorphItems(morphItems, searchRecords);

    expect(result.map((item) => item.recordId)).toEqual(['1', '2', '3']);
  });

  it('should sort by search record order within selected items', () => {
    const morphItems: RecordPickerPickableMorphItem[] = [
      createMorphItem('3', true),
      createMorphItem('1', true),
      createMorphItem('2', true),
    ];
    const searchRecords: SearchRecord[] = [
      createSearchRecord('1'),
      createSearchRecord('2'),
      createSearchRecord('3'),
    ];

    const result = sortMorphItems(morphItems, searchRecords);

    expect(result.map((item) => item.recordId)).toEqual(['1', '2', '3']);
  });

  it('should handle mixed selected and non-selected items with correct ordering', () => {
    const morphItems: RecordPickerPickableMorphItem[] = [
      createMorphItem('4', false),
      createMorphItem('2', true),
      createMorphItem('1', false),
      createMorphItem('3', true),
    ];
    const searchRecords: SearchRecord[] = [
      createSearchRecord('1'),
      createSearchRecord('2'),
      createSearchRecord('3'),
      createSearchRecord('4'),
    ];

    const result = sortMorphItems(morphItems, searchRecords);

    expect(result.map((item) => item.recordId)).toEqual(['2', '3', '1', '4']);
    expect(result[0].isSelected).toBe(true);
    expect(result[1].isSelected).toBe(true);
    expect(result[2].isSelected).toBe(false);
    expect(result[3].isSelected).toBe(false);
  });

  it('should handle empty morphItems array', () => {
    const morphItems: RecordPickerPickableMorphItem[] = [];
    const searchRecords: SearchRecord[] = [createSearchRecord('1')];

    const result = sortMorphItems(morphItems, searchRecords);

    expect(result).toEqual([]);
  });

  it('should handle empty searchRecords array', () => {
    const morphItems: RecordPickerPickableMorphItem[] = [
      createMorphItem('1', false),
      createMorphItem('2', true),
    ];
    const searchRecords: SearchRecord[] = [];

    const result = sortMorphItems(morphItems, searchRecords);

    expect(result[0].recordId).toBe('2');
    expect(result[0].isSelected).toBe(true);
  });

  it('should place items not present in searchRecords before indexed items', () => {
    const morphItems: RecordPickerPickableMorphItem[] = [
      createMorphItem('unknown', false),
      createMorphItem('1', false),
    ];
    const searchRecords: SearchRecord[] = [createSearchRecord('1')];

    const result = sortMorphItems(morphItems, searchRecords);

    // Items not in searchRecords get rank -1, so they come before items with rank >= 0
    expect(result[0].recordId).toBe('unknown');
    expect(result[1].recordId).toBe('1');
  });
});
