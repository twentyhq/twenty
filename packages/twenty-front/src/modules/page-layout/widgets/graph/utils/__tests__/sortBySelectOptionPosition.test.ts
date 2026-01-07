import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type RawDimensionValue } from '@/page-layout/widgets/graph/types/RawDimensionValue';
import { sortBySelectOptionPosition } from '@/page-layout/widgets/graph/utils/sortBySelectOptionPosition';

describe('sortBySelectOptionPosition', () => {
  const mockOptions: FieldMetadataItemOption[] = [
    { id: '1', value: 'NEW', label: 'New', position: 0, color: 'red' },
    {
      id: '2',
      value: 'IN_PROGRESS',
      label: 'In Progress',
      position: 1,
      color: 'yellow',
    },
    { id: '3', value: 'DONE', label: 'Done', position: 2, color: 'green' },
    {
      id: '4',
      value: 'ARCHIVED',
      label: 'Archived',
      position: 3,
      color: 'gray',
    },
  ];

  const buildFormattedToRawLookup = (
    values: { formatted: string; raw: string }[],
  ): Map<string, RawDimensionValue> => {
    const lookup = new Map<string, RawDimensionValue>();
    values.forEach(({ formatted, raw }) => {
      lookup.set(formatted, raw as RawDimensionValue);
    });
    return lookup;
  };

  describe('ASC direction', () => {
    it('should sort items by select option position in ascending order', () => {
      const items = [
        { id: 'Done', value: 10 },
        { id: 'New', value: 5 },
        { id: 'In Progress', value: 8 },
      ];

      const formattedToRawLookup = buildFormattedToRawLookup([
        { formatted: 'Done', raw: 'DONE' },
        { formatted: 'New', raw: 'NEW' },
        { formatted: 'In Progress', raw: 'IN_PROGRESS' },
      ]);

      const result = sortBySelectOptionPosition({
        items,
        options: mockOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item.id,
        direction: 'ASC',
      });

      expect(result.map((item) => item.id)).toEqual([
        'New',
        'In Progress',
        'Done',
      ]);
    });

    it('should place items with unknown options at the end when ascending', () => {
      const items = [
        { id: 'Unknown', value: 1 },
        { id: 'Done', value: 10 },
        { id: 'New', value: 5 },
      ];

      const formattedToRawLookup = buildFormattedToRawLookup([
        { formatted: 'Unknown', raw: 'UNKNOWN_VALUE' },
        { formatted: 'Done', raw: 'DONE' },
        { formatted: 'New', raw: 'NEW' },
      ]);

      const result = sortBySelectOptionPosition({
        items,
        options: mockOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item.id,
        direction: 'ASC',
      });

      expect(result.map((item) => item.id)).toEqual(['New', 'Done', 'Unknown']);
    });
  });

  describe('DESC direction', () => {
    it('should sort items by select option position in descending order', () => {
      const items = [
        { id: 'New', value: 5 },
        { id: 'Done', value: 10 },
        { id: 'In Progress', value: 8 },
      ];

      const formattedToRawLookup = buildFormattedToRawLookup([
        { formatted: 'New', raw: 'NEW' },
        { formatted: 'Done', raw: 'DONE' },
        { formatted: 'In Progress', raw: 'IN_PROGRESS' },
      ]);

      const result = sortBySelectOptionPosition({
        items,
        options: mockOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item.id,
        direction: 'DESC',
      });

      expect(result.map((item) => item.id)).toEqual([
        'Done',
        'In Progress',
        'New',
      ]);
    });

    it('should place items with unknown options at the beginning when descending', () => {
      const items = [
        { id: 'New', value: 5 },
        { id: 'Unknown', value: 1 },
        { id: 'Done', value: 10 },
      ];

      const formattedToRawLookup = buildFormattedToRawLookup([
        { formatted: 'New', raw: 'NEW' },
        { formatted: 'Unknown', raw: 'UNKNOWN_VALUE' },
        { formatted: 'Done', raw: 'DONE' },
      ]);

      const result = sortBySelectOptionPosition({
        items,
        options: mockOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item.id,
        direction: 'DESC',
      });

      expect(result.map((item) => item.id)).toEqual(['Unknown', 'Done', 'New']);
    });
  });

  describe('edge cases', () => {
    it('should handle empty items array', () => {
      const formattedToRawLookup = new Map<string, RawDimensionValue>();

      const result = sortBySelectOptionPosition({
        items: [],
        options: mockOptions,
        formattedToRawLookup,
        getFormattedValue: (item: { id: string }) => item.id,
        direction: 'ASC',
      });

      expect(result).toEqual([]);
    });

    it('should handle items not in lookup', () => {
      const items = [
        { id: 'NotInLookup', value: 5 },
        { id: 'New', value: 10 },
      ];

      const formattedToRawLookup = buildFormattedToRawLookup([
        { formatted: 'New', raw: 'NEW' },
      ]);

      const result = sortBySelectOptionPosition({
        items,
        options: mockOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item.id,
        direction: 'ASC',
      });

      expect(result.map((item) => item.id)).toEqual(['New', 'NotInLookup']);
    });

    it('should not mutate the original array', () => {
      const items = [
        { id: 'Done', value: 10 },
        { id: 'New', value: 5 },
      ];

      const formattedToRawLookup = buildFormattedToRawLookup([
        { formatted: 'Done', raw: 'DONE' },
        { formatted: 'New', raw: 'NEW' },
      ]);

      const originalItems = [...items];

      sortBySelectOptionPosition({
        items,
        options: mockOptions,
        formattedToRawLookup,
        getFormattedValue: (item) => item.id,
        direction: 'ASC',
      });

      expect(items).toEqual(originalItems);
    });
  });
});
