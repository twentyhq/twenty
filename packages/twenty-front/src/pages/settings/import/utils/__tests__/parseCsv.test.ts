import { FieldMetadataType } from 'twenty-shared/types';

// eslint-disable-next-line prettier/prettier
import { convertCsvValueToFieldType, parseCsvColumns, parseCsvRows, } from '../csv.utils';

describe('CSV Utils', () => {
  describe('parseCsvColumns', () => {
    it('should parse CSV headers and sample data correctly', () => {
      const csvContent = `name,email,age
    John Doe,john@example.com,30
    Jane Smith,jane@example.com,25
    Bob Johnson,bob@example.com,35`;

      const result = parseCsvColumns(csvContent);

      expect(result).toEqual([
        {
          name: 'name',
          sampleData: ['John Doe', 'Jane Smith', 'Bob Johnson'],
        },
        {
          name: 'email',
          sampleData: [
            'john@example.com',
            'jane@example.com',
            'bob@example.com',
          ],
        },
        {
          name: 'age',
          sampleData: ['30', '25', '35'],
        },
      ]);
    });

    it('should handle CSV with quoted headers', () => {
      const csvContent = `"first name","email address","phone number"
    "John Doe","john@example.com","123-456-7890"`;

      const result = parseCsvColumns(csvContent);

      expect(result).toEqual([
        {
          name: 'first name',
          sampleData: ['John Doe'],
        },
        {
          name: 'email address',
          sampleData: ['john@example.com'],
        },
        {
          name: 'phone number',
          sampleData: ['123-456-7890'],
        },
      ]);
    });

    it('should limit sample data to maximum 3 rows', () => {
      const csvContent = `name,email
    John,john@example.com
    Jane,jane@example.com
    Bob,bob@example.com
    Alice,alice@example.com
    Charlie,charlie@example.com`;

      const result = parseCsvColumns(csvContent);

      expect(result[0].sampleData).toEqual(['John', 'Jane', 'Bob']);
      expect(result[1].sampleData).toEqual([
        'john@example.com',
        'jane@example.com',
        'bob@example.com',
      ]);
    });

    it('should handle CSV with missing values', () => {
      const csvContent = `name,email,age
    John Doe,john@example.com,
    Jane Smith,,25
    ,bob@example.com,35`;

      const result = parseCsvColumns(csvContent);

      expect(result).toEqual([
        {
          name: 'name',
          sampleData: ['John Doe', 'Jane Smith'],
        },
        {
          name: 'email',
          sampleData: ['john@example.com', 'bob@example.com'],
        },
        {
          name: 'age',
          sampleData: ['25', '35'],
        },
      ]);
    });

    it('should handle empty CSV content', () => {
      const result = parseCsvColumns('');

      expect(result).toEqual([]);
    });

    it('should handle CSV with only headers', () => {
      const csvContent = 'name,email,age';

      const result = parseCsvColumns(csvContent);

      expect(result).toEqual([
        { name: 'name', sampleData: [] },
        { name: 'email', sampleData: [] },
        { name: 'age', sampleData: [] },
      ]);
    });

    it('should handle CSV with whitespace and empty lines', () => {
      const csvContent = `
    name,email,age

    John Doe,john@example.com,30

    Jane Smith,jane@example.com,25
    `;

      const result = parseCsvColumns(csvContent);

      expect(result).toEqual([
        {
          name: 'name',
          sampleData: ['John Doe', 'Jane Smith'],
        },
        {
          name: 'email',
          sampleData: ['john@example.com', 'jane@example.com'],
        },
        {
          name: 'age',
          sampleData: ['30', '25'],
        },
      ]);
    });

    it('should handle inconsistent column count', () => {
      const csvContent = `name,email,age
    John Doe,john@example.com
    Jane Smith,jane@example.com,25,extra`;

      const result = parseCsvColumns(csvContent);

      expect(result).toEqual([
        {
          name: 'name',
          sampleData: ['John Doe', 'Jane Smith'],
        },
        {
          name: 'email',
          sampleData: ['john@example.com', 'jane@example.com'],
        },
        {
          name: 'age',
          sampleData: ['25'],
        },
      ]);
    });
  });

  describe('parseCsvRows', () => {
    it('should parse CSV rows correctly', () => {
      const csvContent = `name,email,age
    John Doe,john@example.com,30
    Jane Smith,jane@example.com,25`;

      const result = parseCsvRows(csvContent);

      expect(result).toEqual([
        {
          name: 'John Doe',
          email: 'john@example.com',
          age: '30',
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          age: '25',
        },
      ]);
    });

    it('should handle CSV with quoted values', () => {
      const csvContent = `"first name","last name","email"
    "John","Doe","john@example.com"
    "Jane","Smith","jane@example.com"`;

      const result = parseCsvRows(csvContent);

      expect(result).toEqual([
        {
          'first name': 'John',
          'last name': 'Doe',
          email: 'john@example.com',
        },
        {
          'first name': 'Jane',
          'last name': 'Smith',
          email: 'jane@example.com',
        },
      ]);
    });

    it('should handle missing values with empty strings', () => {
      const csvContent = `name,email,age
    John Doe,,30
    Jane Smith,jane@example.com,`;

      const result = parseCsvRows(csvContent);

      expect(result).toEqual([
        {
          name: 'John Doe',
          email: '',
          age: '30',
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          age: '',
        },
      ]);
    });

    it('should return empty array for CSV with only headers', () => {
      const csvContent = 'name,email,age';

      const result = parseCsvRows(csvContent);

      expect(result).toEqual([]);
    });

    it('should return empty array for empty CSV', () => {
      const result = parseCsvRows('');

      expect(result).toEqual([]);
    });

    it('should return empty array for CSV with only empty lines', () => {
      const csvContent = '\n\n\n';

      const result = parseCsvRows(csvContent);

      expect(result).toEqual([]);
    });

    it('should handle inconsistent column count', () => {
      const csvContent = `name,email,age
    John Doe,john@example.com
    Jane Smith,jane@example.com,25,extra,data`;

      const result = parseCsvRows(csvContent);

      expect(result).toEqual([
        {
          name: 'John Doe',
          email: 'john@example.com',
          age: '',
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          age: '25',
        },
      ]);
    });

    it('should filter out empty lines', () => {
      const csvContent = `name,email,age

    John Doe,john@example.com,30

    Jane Smith,jane@example.com,25

    `;

      const result = parseCsvRows(csvContent);

      expect(result).toEqual([
        {
          name: 'John Doe',
          email: 'john@example.com',
          age: '30',
        },
        {
          name: 'Jane Smith',
          email: 'jane@example.com',
          age: '25',
        },
      ]);
    });
  });

  describe('convertCsvValueToFieldType', () => {
    describe('TEXT and text-like fields', () => {
      it('should handle TEXT fields', () => {
        expect(
          convertCsvValueToFieldType('Hello World', FieldMetadataType.TEXT),
        ).toBe('Hello World');
        expect(
          convertCsvValueToFieldType('  trimmed  ', FieldMetadataType.TEXT),
        ).toBe('trimmed');
      });

      it('should handle EMAIL fields', () => {
        expect(
          convertCsvValueToFieldType(
            'test@example.com',
            FieldMetadataType.EMAILS,
          ),
        ).toBe('test@example.com');
      });

      it('should handle PHONE fields', () => {
        expect(
          convertCsvValueToFieldType('123-456-7890', FieldMetadataType.PHONES),
        ).toBe('123-456-7890');
      });

      it('should handle LINKS fields', () => {
        expect(
          convertCsvValueToFieldType(
            'https://example.com',
            FieldMetadataType.LINKS,
          ),
        ).toBe('https://example.com');
      });

      it('should handle RICH_TEXT fields', () => {
        expect(
          convertCsvValueToFieldType(
            '<p>Rich text</p>',
            FieldMetadataType.RICH_TEXT,
          ),
        ).toBe('<p>Rich text</p>');
      });
    });

    describe('NUMBER fields', () => {
      it('should convert valid numbers', () => {
        expect(
          convertCsvValueToFieldType('123', FieldMetadataType.NUMBER),
        ).toBe(123);
        expect(
          convertCsvValueToFieldType('123.45', FieldMetadataType.NUMBER),
        ).toBe(123.45);
        expect(
          convertCsvValueToFieldType('-123.45', FieldMetadataType.NUMBER),
        ).toBe(-123.45);
        expect(convertCsvValueToFieldType('0', FieldMetadataType.NUMBER)).toBe(
          0,
        );
      });

      it('should return null for invalid numbers', () => {
        expect(
          convertCsvValueToFieldType('not a number', FieldMetadataType.NUMBER),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType('', FieldMetadataType.NUMBER),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType('NaN', FieldMetadataType.NUMBER),
        ).toBeNull();
      });
    });

    describe('BOOLEAN fields', () => {
      it('should convert truthy values', () => {
        expect(
          convertCsvValueToFieldType('true', FieldMetadataType.BOOLEAN),
        ).toBe(true);
        expect(
          convertCsvValueToFieldType('TRUE', FieldMetadataType.BOOLEAN),
        ).toBe(true);
        expect(convertCsvValueToFieldType('1', FieldMetadataType.BOOLEAN)).toBe(
          true,
        );
        expect(
          convertCsvValueToFieldType('yes', FieldMetadataType.BOOLEAN),
        ).toBe(true);
        expect(
          convertCsvValueToFieldType('YES', FieldMetadataType.BOOLEAN),
        ).toBe(true);
      });

      it('should convert falsy values', () => {
        expect(
          convertCsvValueToFieldType('false', FieldMetadataType.BOOLEAN),
        ).toBe(false);
        expect(
          convertCsvValueToFieldType('FALSE', FieldMetadataType.BOOLEAN),
        ).toBe(false);
        expect(convertCsvValueToFieldType('0', FieldMetadataType.BOOLEAN)).toBe(
          false,
        );
        expect(
          convertCsvValueToFieldType('no', FieldMetadataType.BOOLEAN),
        ).toBe(false);
        expect(
          convertCsvValueToFieldType('random', FieldMetadataType.BOOLEAN),
        ).toBe(false);
      });
    });

    describe('DATE and DATE_TIME fields', () => {
      it('should convert valid dates', () => {
        const validDates = [
          '2023-12-25',
          '2023-12-25T10:30:00Z',
          'December 25, 2023',
          '12/25/2023',
        ];

        validDates.forEach((dateStr) => {
          const result = convertCsvValueToFieldType(
            dateStr,
            FieldMetadataType.DATE,
          );
          expect(result).not.toBeNull();
          expect(typeof result).toBe('string');
          expect(() => new Date(result as string)).not.toThrow();
        });
      });

      it('should return null for invalid dates', () => {
        expect(
          convertCsvValueToFieldType('not a date', FieldMetadataType.DATE),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType('2023-13-45', FieldMetadataType.DATE),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType('', FieldMetadataType.DATE),
        ).toBeNull();
      });

      it('should handle DATE_TIME fields', () => {
        const result = convertCsvValueToFieldType(
          '2023-12-25T10:30:00Z',
          FieldMetadataType.DATE_TIME,
        );
        expect(result).toBe('2023-12-25T10:30:00.000Z');
      });
    });

    describe('RATING fields', () => {
      it('should convert valid ratings', () => {
        expect(convertCsvValueToFieldType('1', FieldMetadataType.RATING)).toBe(
          1,
        );
        expect(convertCsvValueToFieldType('3', FieldMetadataType.RATING)).toBe(
          3,
        );
        expect(convertCsvValueToFieldType('5', FieldMetadataType.RATING)).toBe(
          5,
        );
      });

      it('should return null for invalid ratings', () => {
        expect(
          convertCsvValueToFieldType('0', FieldMetadataType.RATING),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType('6', FieldMetadataType.RATING),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType('3.5', FieldMetadataType.RATING),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType('not a number', FieldMetadataType.RATING),
        ).toBeNull();
      });
    });

    describe('RAW_JSON fields', () => {
      it('should parse valid JSON', () => {
        expect(
          convertCsvValueToFieldType(
            '{"key": "value"}',
            FieldMetadataType.RAW_JSON,
          ),
        ).toEqual({
          key: 'value',
        });
        expect(
          convertCsvValueToFieldType('[1, 2, 3]', FieldMetadataType.RAW_JSON),
        ).toEqual([1, 2, 3]);
        expect(
          convertCsvValueToFieldType('true', FieldMetadataType.RAW_JSON),
        ).toBe(true);
        expect(
          convertCsvValueToFieldType('123', FieldMetadataType.RAW_JSON),
        ).toBe(123);
      });

      it('should return original string for invalid JSON', () => {
        expect(
          convertCsvValueToFieldType('not json', FieldMetadataType.RAW_JSON),
        ).toBe('not json');
        expect(
          convertCsvValueToFieldType(
            '{invalid json}',
            FieldMetadataType.RAW_JSON,
          ),
        ).toBe('{invalid json}');
      });
    });

    describe('ARRAY fields', () => {
      it('should parse valid JSON arrays', () => {
        expect(
          convertCsvValueToFieldType(
            '["a", "b", "c"]',
            FieldMetadataType.ARRAY,
          ),
        ).toEqual(['a', 'b', 'c']);
        expect(
          convertCsvValueToFieldType('[1, 2, 3]', FieldMetadataType.ARRAY),
        ).toEqual([1, 2, 3]);
      });

      it('should wrap non-arrays in array', () => {
        expect(
          convertCsvValueToFieldType(
            '{"key": "value"}',
            FieldMetadataType.ARRAY,
          ),
        ).toEqual(['{"key": "value"}']);
      });

      it('should split comma-separated values for invalid JSON', () => {
        expect(
          convertCsvValueToFieldType(
            'apple, banana, cherry',
            FieldMetadataType.ARRAY,
          ),
        ).toEqual(['apple', 'banana', 'cherry']);
        expect(
          convertCsvValueToFieldType('single item', FieldMetadataType.ARRAY),
        ).toEqual(['single item']);
      });

      it('should filter out empty values when splitting', () => {
        expect(
          convertCsvValueToFieldType(
            'apple, , banana, ',
            FieldMetadataType.ARRAY,
          ),
        ).toEqual(['apple', 'banana']);
      });
    });

    describe('Edge cases', () => {
      it('should return null for empty or whitespace-only values', () => {
        expect(
          convertCsvValueToFieldType('', FieldMetadataType.TEXT),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType('   ', FieldMetadataType.TEXT),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType('\t\n', FieldMetadataType.TEXT),
        ).toBeNull();
      });

      it('should handle unknown field types', () => {
        expect(convertCsvValueToFieldType('value', 'UNKNOWN_TYPE' as any)).toBe(
          'value',
        );
      });

      it('should handle null and undefined inputs', () => {
        expect(
          convertCsvValueToFieldType(null as any, FieldMetadataType.TEXT),
        ).toBeNull();
        expect(
          convertCsvValueToFieldType(undefined as any, FieldMetadataType.TEXT),
        ).toBeNull();
      });
    });
  });
});
