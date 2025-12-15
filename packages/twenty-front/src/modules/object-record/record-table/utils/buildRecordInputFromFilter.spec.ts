import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { type ColorScheme } from '@/workspace-member/types/WorkspaceMember';
import {
  type FilterableFieldType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { RelationType } from '~/generated-metadata/graphql';
import { buildValueFromFilter } from './buildRecordInputFromFilter';

// TODO: fix the dates, and test the not supported types
const mockDate = new Date('2024-03-20T12:00:00Z');

beforeAll(() => {
  jest.useFakeTimers();
  jest.setSystemTime(mockDate);
});

afterAll(() => {
  jest.useRealTimers();
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
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'test',
        expected: undefined,
      },
      {
        operand: ViewFilterOperand.IS_NOT_EMPTY,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.IS_EMPTY,
        value: 'test',
        expected: undefined,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'TEXT');
        expect(buildValueFromFilter({ filter })).toBe(expected);
      },
    );
  });

  describe('DATE_TIME field type', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.IS,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IS_AFTER,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IS_BEFORE,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IS_IN_PAST,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IS_IN_FUTURE,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IS_TODAY,
        value: '',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IS_RELATIVE,
        value: '',
        expected: mockDate,
      },
      {
        operand: ViewFilterOperand.IS_EMPTY,
        value: '',
        expected: undefined,
      },
      {
        operand: ViewFilterOperand.IS_NOT_EMPTY,
        value: '2024-03-20T12:00:00Z',
        expected: mockDate,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'DATE_TIME');
        const result = buildValueFromFilter({ filter });
        if (expected instanceof Date) {
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
        operand: ViewFilterOperand.IS,
        value: '5',
        expected: 5,
      },
      {
        operand: ViewFilterOperand.IS_NOT,
        value: '5',
        expected: undefined,
      },
      {
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: '5',
        expected: 6,
      },
      {
        operand: ViewFilterOperand.LESS_THAN_OR_EQUAL,
        value: '5',
        expected: 4,
      },
      {
        operand: ViewFilterOperand.IS_NOT_EMPTY,
        value: '5',
        expected: 5,
      },
      {
        operand: ViewFilterOperand.IS_EMPTY,
        value: '5',
        expected: undefined,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'NUMBER');
        expect(buildValueFromFilter({ filter })).toBe(expected);
      },
    );
  });

  describe('BOOLEAN field type', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.IS,
        value: 'true',
        expected: true,
      },
      {
        operand: ViewFilterOperand.IS,
        value: 'false',
        expected: false,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'BOOLEAN');
        expect(buildValueFromFilter({ filter })).toBe(expected);
      },
    );
  });

  describe('ARRAY field type', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.CONTAINS,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: 'test',
        expected: undefined,
      },
      {
        operand: ViewFilterOperand.IS_NOT_EMPTY,
        value: 'test',
        expected: 'test',
      },
      {
        operand: ViewFilterOperand.IS_EMPTY,
        value: 'test',
        expected: undefined,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'ARRAY');
        expect(buildValueFromFilter({ filter })).toBe(expected);
      },
    );
  });

  describe('RELATION field type', () => {
    const mockCurrentWorkspaceMember = {
      id: 'current-workspace-member-id',
      name: { firstName: 'John', lastName: 'Doe' },
      locale: 'en',
      colorScheme: 'Light' as ColorScheme,
      avatarUrl: '',
      dateFormat: null,
      timeFormat: null,
      timeZone: null,
      userEmail: 'userEmail',
    };

    const testCases = [
      {
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: false,
          selectedRecordIds: ['record-1'],
        }),
        relationType: RelationType.MANY_TO_ONE,
        label: 'belongs to one',
        expected: 'record-1',
      },
      {
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: true,
          selectedRecordIds: ['record-1'],
        }),
        relationType: RelationType.MANY_TO_ONE,
        label: 'Assignee',
        expected: 'current-workspace-member-id',
      },
      {
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: false,
          selectedRecordIds: ['record-1', 'record-2'],
        }),
        relationType: RelationType.ONE_TO_MANY,
        label: 'hasmany',
        expected: undefined,
      },
      {
        operand: ViewFilterOperand.IS_NOT,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: false,
          selectedRecordIds: ['record-1'],
        }),
        relationType: RelationType.MANY_TO_ONE,
        label: 'Assignee',
        expected: undefined,
      },
      {
        operand: ViewFilterOperand.IS_EMPTY,
        value: JSON.stringify({
          isCurrentWorkspaceMemberSelected: false,
          selectedRecordIds: ['record-1'],
        }),
        relationType: RelationType.MANY_TO_ONE,
        label: 'Assignee',
        expected: undefined,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value" for $relationType relation',
      ({ operand, value, relationType, label, expected }) => {
        const filter = createTestFilter(operand, value, 'RELATION');
        expect(
          buildValueFromFilter({
            filter,
            relationType,
            currentWorkspaceMember: mockCurrentWorkspaceMember,
            label,
          }),
        ).toEqual(expected);
      },
    );
  });

  describe('Composite field types', () => {
    const compositeTypes: FilterableFieldType[] = ['ACTOR', 'FULL_NAME'];

    it.each(compositeTypes)(
      'should return undefined for composite type %s',
      (type) => {
        const filter = createTestFilter(ViewFilterOperand.IS, 'test', type);
        expect(buildValueFromFilter({ filter })).toBeUndefined();
      },
    );
  });

  describe('RAW_JSON field type', () => {
    it('should return undefined', () => {
      const filter = createTestFilter(ViewFilterOperand.IS, 'test', 'RAW_JSON');
      expect(buildValueFromFilter({ filter })).toBeUndefined();
    });
  });

  describe('RATING field type', () => {
    const mockOptions = [
      {
        label: 'Rating 1',
        value: 'RATING_1',
        id: '1',
        position: 1,
      },
      {
        label: 'Rating 2',
        value: 'RATING_2',
        id: '2',
        position: 2,
      },
      {
        label: 'Rating 3',
        value: 'RATING_3',
        id: '3',
        position: 3,
      },
    ];

    const testCases = [
      {
        operand: ViewFilterOperand.IS,
        value: 'Rating 1',
        expected: 'RATING_1',
      },
      {
        operand: ViewFilterOperand.IS_NOT_EMPTY,
        value: 'Rating 2',
        expected: 'RATING_2',
      },
      {
        operand: ViewFilterOperand.IS_EMPTY,
        value: 'Rating 1',
        expected: undefined,
      },
      {
        operand: ViewFilterOperand.GREATER_THAN_OR_EQUAL,
        value: 'Rating 1',
        expected: 'RATING_2',
      },
      {
        operand: ViewFilterOperand.LESS_THAN_OR_EQUAL,
        value: 'Rating 2',
        expected: 'RATING_1',
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'RATING');
        expect(
          buildValueFromFilter({
            filter,
            options: mockOptions as FieldMetadataItemOption[],
          }),
        ).toBe(expected);
      },
    );

    it('should return undefined when option is not found', () => {
      const filter = createTestFilter(
        ViewFilterOperand.IS,
        'Rating 4',
        'RATING',
      );
      expect(
        buildValueFromFilter({
          filter,
          options: mockOptions as FieldMetadataItemOption[],
        }),
      ).toBeUndefined();
    });
  });

  describe('SELECT field type', () => {
    const mockOptions = [
      {
        label: 'Option 1',
        value: 'OPTION_1',
        color: 'red',
        id: '1',
        position: 1,
      },
      {
        label: 'Option 2',
        value: 'OPTION_2',
        color: 'blue',
        id: '2',
        position: 2,
      },
    ];

    const testCases = [
      {
        operand: ViewFilterOperand.IS,
        value: JSON.stringify(['OPTION_1']),
        expected: 'OPTION_1',
      },
      {
        operand: ViewFilterOperand.IS_NOT,
        value: JSON.stringify(['OPTION_1']),
        expected: undefined,
      },
      {
        operand: ViewFilterOperand.IS_EMPTY,
        value: JSON.stringify(['OPTION_1']),
        expected: undefined,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'SELECT');
        expect(
          buildValueFromFilter({
            filter,
            options: mockOptions as FieldMetadataItemOption[],
          }),
        ).toBe(expected);
      },
    );

    it('should handle invalid JSON', () => {
      const filter = createTestFilter(
        ViewFilterOperand.IS,
        'invalid-json',
        'SELECT',
      );
      expect(
        buildValueFromFilter({
          filter,
          options: mockOptions as FieldMetadataItemOption[],
        }),
      ).toBeUndefined();
    });
  });

  describe('MULTI_SELECT field type', () => {
    const testCases = [
      {
        operand: ViewFilterOperand.CONTAINS,
        value: JSON.stringify(['OPTION_1', 'OPTION_2']),
        expected: ['OPTION_1', 'OPTION_2'],
      },
      {
        operand: ViewFilterOperand.DOES_NOT_CONTAIN,
        value: JSON.stringify(['OPTION_1']),
        expected: undefined,
      },
      {
        operand: ViewFilterOperand.IS_EMPTY,
        value: JSON.stringify(['OPTION_1']),
        expected: undefined,
      },
    ];

    it.each(testCases)(
      'should handle $operand with value "$value"',
      ({ operand, value, expected }) => {
        const filter = createTestFilter(operand, value, 'MULTI_SELECT');
        expect(buildValueFromFilter({ filter })).toEqual(expected);
      },
    );

    it('should handle invalid JSON', () => {
      const filter = createTestFilter(
        ViewFilterOperand.CONTAINS,
        'invalid-json',
        'MULTI_SELECT',
      );
      expect(buildValueFromFilter({ filter })).toBeUndefined();
    });
  });

  describe('UUID field type', () => {
    it('should return the value', () => {
      const filter = createTestFilter(
        ViewFilterOperand.IS,
        'test-uuid',
        'UUID',
      );
      expect(buildValueFromFilter({ filter })).toBe('test-uuid');
    });
  });
});
