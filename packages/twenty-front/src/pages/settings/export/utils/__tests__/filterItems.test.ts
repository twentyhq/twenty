import { ExportObjectItem } from '~/pages/settings/export/types/exportObjectItem';
import { filterItems } from '../filterItems';

describe('filterItems', () => {
  const mockItems: ExportObjectItem[] = [
    {
      id: '1',
      name: 'people',
      labelPlural: 'People',
      objectTypeLabel: { labelText: 'Standard', labelColor: 'blue' },
      objectTypeLabelText: 'Standard',
      fieldsCount: 5,
      totalObjectCount: 100,
      icon: 'IconUser',
    },
    {
      id: '2',
      name: 'companies',
      labelPlural: 'Companies',
      objectTypeLabel: { labelText: 'Custom', labelColor: 'orange' },
      objectTypeLabelText: 'Custom',
      fieldsCount: 3,
      totalObjectCount: 50,
      icon: 'IconBuilding',
    },
    {
      id: '3',
      name: 'opportunities',
      labelPlural: 'Opportunities',
      objectTypeLabel: { labelText: 'Standard', labelColor: 'blue' },
      objectTypeLabelText: 'Standard',
      fieldsCount: 8,
      totalObjectCount: 200,
      icon: 'IconTarget',
    },
    {
      id: '4',
      name: 'contacts',
      labelPlural: 'Contacts',
      objectTypeLabel: { labelText: 'Remote', labelColor: 'green' },
      objectTypeLabelText: 'Remote',
      fieldsCount: 12,
      totalObjectCount: 500,
      icon: 'IconUsers',
    },
  ];

  it('should filter by labelPlural (case insensitive)', () => {
    const result = filterItems(mockItems, 'people');

    expect(result).toHaveLength(1);
    expect(result[0].labelPlural).toBe('People');
  });

  it('should filter by objectTypeLabelText (case insensitive)', () => {
    const result = filterItems(mockItems, 'custom');

    expect(result).toHaveLength(1);
    expect(result[0].objectTypeLabelText).toBe('Custom');
  });

  it('should filter by partial matches in labelPlural', () => {
    const result = filterItems(mockItems, 'comp');

    expect(result).toHaveLength(1);
    expect(result[0].labelPlural).toBe('Companies');
  });

  it('should filter by partial matches in objectTypeLabelText', () => {
    const result = filterItems(mockItems, 'rem');

    expect(result).toHaveLength(1);
    expect(result[0].objectTypeLabelText).toBe('Remote');
  });

  it('should return multiple matches', () => {
    const result = filterItems(mockItems, 'standard');

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.labelPlural)).toEqual([
      'People',
      'Opportunities',
    ]);
  });

  it('should handle uppercase search terms', () => {
    const result = filterItems(mockItems, 'PEOPLE');

    expect(result).toHaveLength(1);
    expect(result[0].labelPlural).toBe('People');
  });

  it('should handle mixed case search terms', () => {
    const result = filterItems(mockItems, 'OpPoRtUnItIeS');

    expect(result).toHaveLength(1);
    expect(result[0].labelPlural).toBe('Opportunities');
  });

  it('should return empty array for no matches', () => {
    const result = filterItems(mockItems, 'nonexistent');

    expect(result).toEqual([]);
  });

  it('should handle empty search term', () => {
    const result = filterItems(mockItems, '');

    expect(result).toEqual(mockItems);
  });

  it('should handle whitespace-only search term', () => {
    const result = filterItems(mockItems, '   ');

    expect(result).toEqual([]);
  });

  it('should handle empty items array', () => {
    const result = filterItems([], 'search');

    expect(result).toEqual([]);
  });

  it('should match items by both labelPlural and objectTypeLabelText', () => {
    const mixedItems: ExportObjectItem[] = [
      ...mockItems,
      {
        id: '5',
        name: 'standardReports',
        labelPlural: 'Standard Reports',
        objectTypeLabel: { labelText: 'Custom', labelColor: 'orange' },
        objectTypeLabelText: 'Custom',
        fieldsCount: 6,
        totalObjectCount: 25,
        icon: 'IconReport',
      },
    ];

    const result = filterItems(mixedItems, 'standard');

    expect(result).toHaveLength(3);
    expect(result.map((item) => item.labelPlural)).toEqual([
      'People',
      'Opportunities',
      'Standard Reports',
    ]);
  });

  it('should handle special characters in search term', () => {
    const specialItems: ExportObjectItem[] = [
      {
        id: '1',
        name: 'reports&analytics',
        labelPlural: 'Reports & Analytics',
        objectTypeLabel: { labelText: 'Standard', labelColor: 'blue' },
        objectTypeLabelText: 'Standard',
        fieldsCount: 5,
        totalObjectCount: 100,
        icon: 'IconReport',
      },
    ];

    const result = filterItems(specialItems, '&');

    expect(result).toHaveLength(1);
    expect(result[0].labelPlural).toBe('Reports & Analytics');
  });
});
