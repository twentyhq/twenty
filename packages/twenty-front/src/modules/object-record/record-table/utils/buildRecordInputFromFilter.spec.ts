import { FilterableFieldType } from '@/object-record/record-filter/types/FilterableFieldType';
import { RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { buildValueFromFilter } from './buildRecordInputFromFilter';

// TODO: fix the dates, and test the not supported types
const mockDate = new Date('2024-03-20T12:00:00Z');
const originalDate = global.Date;

beforeAll(() => {
  jest.spyOn(global, 'Date').mockImplementation((...args) => {
    if (args.length === 0) {
      return mockDate;
    }
    if (args.length === 1) {
      return new (originalDate as any)(args);
    }
    return new (originalDate as any)(...args);
  });
});

afterAll(() => {
  jest.restoreAllMocks();
});

describe('buildValueFromFilter', () => {
  const createTestFilter = (
    operand: ViewFilterOperand,
    value: string,
    type: FilterableFieldType,
  ): RecordFilter => ({
    id: 'test-id',
    fieldMetadataId: 'test-field-id',
    value,
    displayValue: value,
    type,
    operand,
    label: 'Test Label',
  });

  describe('TEXT field type', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.Contains,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.DoesNotContain,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.IsNotEmpty,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.IsEmpty,
        value: 'test',
        expected: 'test',
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'TEXT');
        expect(buildValueFromFilter(filter, 'TEXT')).toBe(expected);
      },
    );
  });

  describe('DATE_TIME field type', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.Is,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IsNot,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IsAfter,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IsBefore,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IsInPast,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IsInFuture,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IsToday,
        value: '',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IsRelative,
        value: '',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IsEmpty,
        value: '',
        expected: undefined,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'DATE_TIME');
        const result = buildValueFromFilter(filter, 'DATE_TIME');
        if (expected instanceof Date) {
          console.log('result type:', typeof result);
          console.log('result constructor:', result?.constructor);
          console.log('result toString:', result?.toString());
          if (result instanceof Date) {
            console.log('result toISOString:', result.toISOString());
            console.log('result getTime:', result.getTime());
          }
          console.log('expected type:', typeof expected);
          console.log('expected constructor:', expected.constructor);
          console.log('expected toString:', expected.toString());
          console.log('expected toISOString:', expected.toISOString());
          console.log('expected getTime:', expected.getTime());
          expect(result).toBeInstanceOf(Date);
          expect(result).toEqual(expected);
        } else {
          expect(result).toBe(expected);
        }
      },
    );
  });

  describe('NUMBER field type', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.GreaterThan,
        value: '5',
        expected: 6,
      },
      {
        operand: ViewFilterOperand.LessThan,
        value: '5',
        expected: 4,
      },
      {
        operand: ViewFilterOperand.IsNotEmpty,
        value: '5',
        expected: 5,
      },
      {
        operand: ViewFilterOperand.IsEmpty,
        value: '5',
        expected: undefined,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'NUMBER');
        expect(buildValueFromFilter(filter, 'NUMBER')).toBe(expected);
      },
    );
  });

  describe('BOOLEAN field type', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.Is,
        value: 'true',
        expected: true,
      },
      {
        operand: ViewFilterOperand.Is,
        value: 'false',
        expected: false,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'BOOLEAN');
        expect(buildValueFromFilter(filter, 'BOOLEAN')).toBe(expected);
      },
    );
  });

  describe('ARRAY field type', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.Contains,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.DoesNotContain,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.IsNotEmpty,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.IsEmpty,
        value: 'test',
        expected: 'test',
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'ARRAY');
        expect(buildValueFromFilter(filter, 'ARRAY')).toBe(expected);
      },
    );
  });

  describe('Unsupported field types', () => {
    const unsupportedTypes: FilterableFieldType[] = ['SELECT', 'RELATION'];

    it.each(unsupportedTypes)(
      'should throw error for unsupported type %s',
      (type) => {
        const filter = createTestFilter(ViewFilterOperand.Is, 'test', type);
        expect(() => buildValueFromFilter(filter, type)).toThrow(
          'Type not supported',
        );
      },
    );
  });

  describe('Unsupported field types', () => {
    const unsupportedTypes: FilterableFieldType[] = ['MULTI_SELECT'];

    it.each(unsupportedTypes)(
      'should throw error for unsupported type %s',
      (type) => {
        const filter = createTestFilter(
          ViewFilterOperand.Contains,
          'test',
          type,
        );
        expect(() => buildValueFromFilter(filter, type)).toThrow(
          'Type not supported',
        );
      },
    );
  });

  describe('Composite field types', () => {
    const compositeTypes: FilterableFieldType[] = ['ACTOR', 'FULL_NAME'];

    it.each(compositeTypes)(
      'should return undefined for composite type %s',
      (type) => {
        const filter = createTestFilter(ViewFilterOperand.Is, 'test', type);
        expect(buildValueFromFilter(filter, type)).toBeUndefined();
      },
    );
  });

  describe('RAW_JSON field type', () => {
    it('should throw error for type %s', () => {
      const filter = {
        id: 'test-id',
        fieldMetadataId: 'test-field-id',
        value: 'test',
        displayValue: 'test',
        type: 'RAW_JSON',
        operand: ViewFilterOperand.Is,
        label: 'Test Label',
      };
      expect(() =>
        buildValueFromFilter(filter as RecordFilter, 'RAW_JSON'),
      ).toThrow('Raw JSON is not supported');
    });
  });
});
