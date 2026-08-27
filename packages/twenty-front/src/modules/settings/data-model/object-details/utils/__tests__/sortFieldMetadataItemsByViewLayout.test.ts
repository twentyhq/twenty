import { sortFieldMetadataItemsByViewLayout } from '@/settings/data-model/object-details/utils/sortFieldMetadataItemsByViewLayout';

describe('sortFieldMetadataItemsByViewLayout', () => {
  it('orders positioned fields by position before unpositioned ones', () => {
    const sorted = sortFieldMetadataItemsByViewLayout({
      fieldMetadataItems: [
        { id: 'unpositioned', label: 'AAA' },
        { id: 'second', label: 'ZZZ' },
        { id: 'first', label: 'MMM' },
      ],
      positionByFieldMetadataId: new Map([
        ['second', 4],
        ['first', 1],
      ]),
    });

    expect(sorted.map((field) => field.id)).toEqual([
      'first',
      'second',
      'unpositioned',
    ]);
  });

  it('breaks position ties by label', () => {
    const sorted = sortFieldMetadataItemsByViewLayout({
      fieldMetadataItems: [
        { id: 'b', label: 'Beta' },
        { id: 'a', label: 'Alpha' },
      ],
      positionByFieldMetadataId: new Map([
        ['a', 2],
        ['b', 2],
      ]),
    });

    expect(sorted.map((field) => field.id)).toEqual(['a', 'b']);
  });

  it('orders unpositioned fields by label', () => {
    const sorted = sortFieldMetadataItemsByViewLayout({
      fieldMetadataItems: [
        { id: 'b', label: 'Beta' },
        { id: 'a', label: 'Alpha' },
      ],
      positionByFieldMetadataId: new Map(),
    });

    expect(sorted.map((field) => field.id)).toEqual(['a', 'b']);
  });

  it('does not mutate the input array', () => {
    const input = [
      { id: 'b', label: 'Beta' },
      { id: 'a', label: 'Alpha' },
    ];

    sortFieldMetadataItemsByViewLayout({
      fieldMetadataItems: input,
      positionByFieldMetadataId: new Map(),
    });

    expect(input.map((field) => field.id)).toEqual(['b', 'a']);
  });
});
