import { getObjectTypeLabel } from '@/settings/data-model/utils/getObjectTypeLabel';
import { createExportItems } from '../createExportItems';

jest.mock('@/settings/data-model/utils/getObjectTypeLabel');

describe('createExportItems', () => {
  const mockGetObjectTypeLabel = getObjectTypeLabel as jest.MockedFunction<
    typeof getObjectTypeLabel
  >;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetObjectTypeLabel.mockReturnValue({
      labelText: 'Standard',
      labelColor: 'blue',
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should create export items from object metadata', () => {
    const objectMetadataItems = [
      {
        id: '1',
        namePlural: 'people',
        labelPlural: 'People',
        fields: [
          { name: 'id', isSystem: true },
          { name: 'email', isSystem: false },
          { name: 'name', isSystem: false },
          { name: 'createdAt', isSystem: true },
        ],
        icon: 'IconUser',
      },
      {
        id: '2',
        namePlural: 'companies',
        labelPlural: 'Companies',
        fields: [
          { name: 'id', isSystem: true },
          { name: 'name', isSystem: false },
        ],
        icon: 'IconBuilding',
      },
    ];

    const totalCounts = {
      people: 150,
      companies: 75,
    };

    const result = createExportItems(objectMetadataItems, totalCounts);

    expect(result).toEqual([
      {
        id: '1',
        name: 'people',
        labelPlural: 'People',
        objectTypeLabel: { labelText: 'Standard', labelColor: 'blue' },
        objectTypeLabelText: 'Standard',
        fieldsCount: 2,
        totalObjectCount: 150,
        icon: 'IconUser',
      },
      {
        id: '2',
        name: 'companies',
        labelPlural: 'Companies',
        objectTypeLabel: { labelText: 'Standard', labelColor: 'blue' },
        objectTypeLabelText: 'Standard',
        fieldsCount: 1,
        totalObjectCount: 75,
        icon: 'IconBuilding',
      },
    ]);

    expect(mockGetObjectTypeLabel).toHaveBeenCalledTimes(2);
  });

  it('should handle missing total counts', () => {
    const objectMetadataItems = [
      {
        id: '1',
        namePlural: 'people',
        labelPlural: 'People',
        fields: [{ name: 'email', isSystem: false }],
        icon: 'IconUser',
      },
    ];

    const result = createExportItems(objectMetadataItems, {});

    expect(result[0].totalObjectCount).toBe(0);
    expect(mockGetObjectTypeLabel).toHaveBeenCalledTimes(1);
  });

  it('should handle empty object metadata items', () => {
    const result = createExportItems([], {});

    expect(result).toEqual([]);
    expect(mockGetObjectTypeLabel).toHaveBeenCalledTimes(0);
  });

  it('should correctly count only non-system fields', () => {
    const objectMetadataItems = [
      {
        id: '1',
        namePlural: 'tasks',
        labelPlural: 'Tasks',
        fields: [
          { name: 'id', isSystem: true },
          { name: 'createdAt', isSystem: true },
          { name: 'updatedAt', isSystem: true },
          { name: 'title', isSystem: false },
          { name: 'description', isSystem: false },
          { name: 'status', isSystem: false },
        ],
        icon: 'IconCheckbox',
      },
    ];

    const result = createExportItems(objectMetadataItems, {});

    expect(result[0].fieldsCount).toBe(3);
    expect(mockGetObjectTypeLabel).toHaveBeenCalledTimes(1);
  });

  it('should call getObjectTypeLabel for each item', () => {
    const objectMetadataItems = [
      {
        id: '1',
        namePlural: 'people',
        labelPlural: 'People',
        fields: [],
        icon: 'IconUser',
      },
      {
        id: '2',
        namePlural: 'companies',
        labelPlural: 'Companies',
        fields: [],
        icon: 'IconBuilding',
      },
    ];

    createExportItems(objectMetadataItems, {});

    expect(mockGetObjectTypeLabel).toHaveBeenCalledTimes(2);
    expect(mockGetObjectTypeLabel).toHaveBeenNthCalledWith(
      1,
      objectMetadataItems[0],
    );
    expect(mockGetObjectTypeLabel).toHaveBeenNthCalledWith(
      2,
      objectMetadataItems[1],
    );
  });

  it('should handle different object type labels', () => {
    mockGetObjectTypeLabel.mockReturnValueOnce({
      labelText: 'Custom',
      labelColor: 'orange',
    });

    const objectMetadataItems = [
      {
        id: '1',
        namePlural: 'customObjects',
        labelPlural: 'Custom Objects',
        fields: [{ name: 'name', isSystem: false }],
        icon: 'IconCustom',
      },
    ];

    const result = createExportItems(objectMetadataItems, {});

    expect(result[0].objectTypeLabelText).toBe('Custom');
    expect(result[0].objectTypeLabel).toEqual({
      labelText: 'Custom',
      labelColor: 'orange',
    });
    expect(mockGetObjectTypeLabel).toHaveBeenCalledTimes(1);
  });

  it('should handle fields array edge cases', () => {
    const objectMetadataItems = [
      {
        id: '1',
        namePlural: 'emptyFields',
        labelPlural: 'Empty Fields',
        fields: [],
        icon: 'IconEmpty',
      },
      {
        id: '2',
        namePlural: 'allSystemFields',
        labelPlural: 'All System Fields',
        fields: [
          { name: 'id', isSystem: true },
          { name: 'createdAt', isSystem: true },
          { name: 'updatedAt', isSystem: true },
        ],
        icon: 'IconSystem',
      },
    ];

    const result = createExportItems(objectMetadataItems, {});

    expect(result[0].fieldsCount).toBe(0);
    expect(result[1].fieldsCount).toBe(0);
    expect(mockGetObjectTypeLabel).toHaveBeenCalledTimes(2);
  });

  it('should preserve all properties from object metadata', () => {
    const objectMetadataItems = [
      {
        id: 'test-id-123',
        namePlural: 'testObjects',
        labelPlural: 'Test Objects',
        fields: [
          { name: 'field1', isSystem: false },
          { name: 'field2', isSystem: false },
        ],
        icon: 'IconTest',
      },
    ];

    const totalCounts = {
      testObjects: 42,
    };

    const result = createExportItems(objectMetadataItems, totalCounts);

    expect(result[0]).toMatchObject({
      id: 'test-id-123',
      name: 'testObjects',
      labelPlural: 'Test Objects',
      fieldsCount: 2,
      totalObjectCount: 42,
      icon: 'IconTest',
    });
    expect(mockGetObjectTypeLabel).toHaveBeenCalledTimes(1);
  });

  it('should handle null or undefined fields gracefully', () => {
    const objectMetadataItems = [
      {
        id: '1',
        namePlural: 'nullFields',
        labelPlural: 'Null Fields',
        fields: null as any,
        icon: 'IconNull',
      },
      {
        id: '2',
        namePlural: 'undefinedFields',
        labelPlural: 'Undefined Fields',
        fields: undefined as any,
        icon: 'IconUndefined',
      },
    ];

    expect(() => createExportItems(objectMetadataItems, {})).not.toThrow();
    expect(mockGetObjectTypeLabel).toHaveBeenCalledTimes(2);
  });
});
