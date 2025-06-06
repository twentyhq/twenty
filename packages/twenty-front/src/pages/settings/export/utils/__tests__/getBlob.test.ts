import { json2csv } from 'json-2-csv';
import { CompositeField } from '~/pages/settings/export/types/compositeField';
import type { ExportObjectItem } from '~/pages/settings/export/types/exportObjectItem';
import { getBlob } from '../getBlob';

jest.mock('json-2-csv', () => ({
  __esModule: true,
  json2csv: jest.fn(),
}));

const readBlobAsText = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve(reader.result as string);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsText(blob);
  });
};

describe('getBlob', () => {
  const mockJson2csv = json2csv as jest.MockedFunction<typeof json2csv>;

  const mockRawRecords = [
    {
      id: '1',
      name: 'John Doe',
      email: 'john@example.com',
      age: 30,
      __typename: 'Person',
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane@example.com',
      age: 25,
      __typename: 'Person',
    },
  ];

  const mockCompositeFields: CompositeField[] = [
    { name: 'fullName', subFields: ['firstName', 'lastName'] },
    { name: 'address', subFields: ['street', 'city'] },
  ];

  const mockItem: ExportObjectItem = {
    id: '1',
    name: 'people',
    labelPlural: 'People',
    fieldsCount: 3,
    objectTypeLabel: { labelText: 'Standard', labelColor: 'blue' },
    objectTypeLabelText: 'Standard',
    totalObjectCount: 100,
    icon: 'IconUser',
  };

  const mockFieldTypes = [
    { name: 'email', type: 'EMAIL' },
    { name: 'name', type: 'TEXT' },
    { name: 'age', type: 'NUMBER' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (mockJson2csv as any).mockImplementation(() =>
      Promise.resolve(
        'id,name,email,age\n1,John Doe,john@example.com,30\n2,Jane Smith,jane@example.com,25',
      ),
    );
  });

  describe('CSV format', () => {
    it('should create CSV blob', async () => {
      const result = await getBlob(
        'csv',
        mockRawRecords,
        mockCompositeFields,
        false,
        mockItem,
        mockFieldTypes,
      );

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('text/csv;charset=utf-8');
      expect(mockJson2csv).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            age: 30,
          }),
        ]),
      );
    });

    it('should handle CSV conversion errors', async () => {
      (mockJson2csv as any).mockImplementation(() =>
        Promise.reject(new Error('CSV conversion failed')),
      );

      await expect(
        getBlob(
          'csv',
          mockRawRecords,
          mockCompositeFields,
          false,
          mockItem,
          mockFieldTypes,
        ),
      ).rejects.toThrow('CSV conversion failed');
    });

    it('should clean records for CSV (remove __typename)', async () => {
      await getBlob(
        'csv',
        mockRawRecords,
        mockCompositeFields,
        false,
        mockItem,
        mockFieldTypes,
      );

      const cleanedRecords = mockJson2csv.mock.calls[0][0];
      expect(cleanedRecords[0]).not.toHaveProperty('__typename');
      expect(cleanedRecords[1]).not.toHaveProperty('__typename');
    });
  });

  describe('JSON format without type preservation', () => {
    it('should create JSON blob without metadata', async () => {
      const result = await getBlob(
        'json',
        mockRawRecords,
        mockCompositeFields,
        false,
        mockItem,
        mockFieldTypes,
      );

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/json;charset=utf-8');

      const blobText = await readBlobAsText(result);
      const parsedData = JSON.parse(blobText);

      expect(parsedData).toEqual([
        { id: '1', name: 'John Doe', email: 'john@example.com', age: 30 },
        { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 25 },
      ]);
    });

    it('should remove __typename from records', async () => {
      const result = await getBlob(
        'json',
        mockRawRecords,
        mockCompositeFields,
        false,
        mockItem,
        mockFieldTypes,
      );

      const blobText = await readBlobAsText(result);
      const parsedData = JSON.parse(blobText);

      expect(parsedData[0]).not.toHaveProperty('__typename');
      expect(parsedData[1]).not.toHaveProperty('__typename');
    });
  });

  describe('JSON format with type preservation', () => {
    it('should create JSON blob with metadata', async () => {
      const result = await getBlob(
        'json',
        mockRawRecords,
        mockCompositeFields,
        true,
        mockItem,
        mockFieldTypes,
      );

      expect(result).toBeInstanceOf(Blob);
      expect(result.type).toBe('application/json;charset=utf-8');

      const blobText = await readBlobAsText(result);
      const parsedData = JSON.parse(blobText);

      expect(parsedData).toHaveProperty('metadata');
      expect(parsedData).toHaveProperty('data');
    });

    it('should include correct metadata structure', async () => {
      const result = await getBlob(
        'json',
        mockRawRecords,
        mockCompositeFields,
        true,
        mockItem,
        mockFieldTypes,
      );

      const blobText = await readBlobAsText(result);
      const parsedData = JSON.parse(blobText);

      expect(parsedData.metadata).toMatchObject({
        objectName: 'people',
        labelPlural: 'People',
        fieldsCount: 3,
        recordsCount: 2,
        preserveTypes: true,
        version: '1.0',
      });
      expect(parsedData.metadata.exportDate).toMatch(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      );
    });

    it('should include field metadata with correct structure', async () => {
      const result = await getBlob(
        'json',
        mockRawRecords,
        mockCompositeFields,
        true,
        mockItem,
        mockFieldTypes,
      );

      const blobText = await readBlobAsText(result);
      const parsedData = JSON.parse(blobText);

      expect(parsedData.metadata.fields).toEqual([
        { name: 'id', type: 'UUID', isComposite: false },
        { name: 'createdAt', type: 'DATE_TIME', isComposite: false },
        { name: 'updatedAt', type: 'DATE_TIME', isComposite: false },
        { name: 'email', type: 'EMAIL', isComposite: false },
        { name: 'name', type: 'TEXT', isComposite: false },
        { name: 'age', type: 'NUMBER', isComposite: false },
      ]);
    });

    it('should preserve original records with __typename', async () => {
      const result = await getBlob(
        'json',
        mockRawRecords,
        mockCompositeFields,
        true,
        mockItem,
        mockFieldTypes,
      );

      const blobText = await readBlobAsText(result);
      const parsedData = JSON.parse(blobText);

      expect(parsedData.data).toEqual(mockRawRecords);
    });
  });

  describe('Error handling', () => {
    it('should throw error for unsupported format', async () => {
      await expect(
        getBlob(
          'xml' as any,
          mockRawRecords,
          mockCompositeFields,
          false,
          mockItem,
          mockFieldTypes,
        ),
      ).rejects.toThrow('Unsupported format: xml');
    });

    it('should throw error for invalid format type', async () => {
      await expect(
        getBlob(
          undefined as any,
          mockRawRecords,
          mockCompositeFields,
          false,
          mockItem,
          mockFieldTypes,
        ),
      ).rejects.toThrow('Unsupported format: undefined');
    });
  });

  describe('Edge cases', () => {
    it('should handle empty records', async () => {
      const result = await getBlob(
        'json',
        [],
        mockCompositeFields,
        false,
        mockItem,
        mockFieldTypes,
      );

      const blobText = await readBlobAsText(result);
      const parsedData = JSON.parse(blobText);

      expect(parsedData).toEqual([]);
    });

    it('should handle empty records with type preservation', async () => {
      const result = await getBlob(
        'json',
        [],
        mockCompositeFields,
        true,
        mockItem,
        mockFieldTypes,
      );

      const blobText = await readBlobAsText(result);
      const parsedData = JSON.parse(blobText);

      expect(parsedData.metadata.recordsCount).toBe(0);
      expect(parsedData.data).toEqual([]);
    });

    it('should handle null records', async () => {
      const recordsWithNull = [
        {
          id: '1',
          name: null,
          email: 'john@example.com',
          __typename: 'Person',
        },
      ];

      const result = await getBlob(
        'json',
        recordsWithNull,
        mockCompositeFields,
        false,
        mockItem,
        mockFieldTypes,
      );

      const blobText = await readBlobAsText(result);
      const parsedData = JSON.parse(blobText);

      expect(parsedData[0].name).toBeNull();
    });

    it('should handle records with composite fields', async () => {
      const recordsWithComposite = [
        {
          id: '1',
          fullName: { firstName: 'John', lastName: 'Doe' },
          address: { street: '123 Main St', city: 'Anytown' },
          __typename: 'Person',
        },
      ];

      const result = await getBlob(
        'csv',
        recordsWithComposite,
        mockCompositeFields,
        false,
        mockItem,
        mockFieldTypes,
      );

      expect(result).toBeInstanceOf(Blob);
      expect(mockJson2csv).toHaveBeenCalled();
    });
  });
});
