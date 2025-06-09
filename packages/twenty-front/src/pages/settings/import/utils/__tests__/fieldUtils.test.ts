import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import * as reservedFields from '~/pages/settings/import/constants/reservedFieldNames';
import * as reservedPrefixes from '~/pages/settings/import/constants/reservedFieldPrefixes';
import { generateUniqueFieldName, isReservedFieldName } from '../field.utils';
import { capitalizeFirst, formatFileSize } from '../format.utils';

jest.mock(
  '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils',
);
jest.mock('~/pages/settings/import/constants/reservedFieldNames');
jest.mock('~/pages/settings/import/constants/reservedFieldPrefixes');

describe('Field Utils', () => {
  describe('isReservedFieldName', () => {
    beforeEach(() => {
      Object.defineProperty(reservedFields, 'RESERVED_FIELD_NAMES', {
        get: () => ['id', 'createdAt'],
      });
      Object.defineProperty(reservedPrefixes, 'RESERVED_FIELD_PREFIXES', {
        get: () => ['__', '_system'],
      });
    });

    it('should return true for reserved field names', () => {
      expect(isReservedFieldName('id')).toBe(true);
      expect(isReservedFieldName('createdAt')).toBe(true);
    });

    it('should return false for non-reserved field names', () => {
      expect(isReservedFieldName('customField')).toBe(false);
    });
  });

  describe('generateUniqueFieldName', () => {
    const mockComputeMetadataNameFromLabel =
      computeMetadataNameFromLabel as jest.MockedFunction<
        typeof computeMetadataNameFromLabel
      >;

    beforeEach(() => {
      Object.defineProperty(reservedFields, 'RESERVED_FIELD_NAMES', {
        get: () => ['id'],
      });
      Object.defineProperty(reservedPrefixes, 'RESERVED_FIELD_PREFIXES', {
        get: () => ['__'],
      });
      // Mock the implementation for consistent test results
      mockComputeMetadataNameFromLabel.mockImplementation((label) =>
        label.toLowerCase().replace(/\s/g, ''),
      );
    });

    // FIX: Added test cases to the describe block
    it('should generate a simple field name when there are no conflicts', () => {
      const existingFields: string[] = [];
      expect(generateUniqueFieldName('My Field', existingFields)).toBe(
        'myfield',
      );
    });

    it('should generate a unique name when the name is a reserved field', () => {
      const existingFields: string[] = [];
      // 'id' is a reserved field name in the mock setup
      expect(generateUniqueFieldName('ID', existingFields)).toBe('id1');
    });

    it('should generate a unique name when the name already exists', () => {
      const existingFields = ['myfield'];
      expect(generateUniqueFieldName('My Field', existingFields)).toBe(
        'myfield1',
      );
    });

    it('should increment suffix until a unique name is found', () => {
      const existingFields = ['myfield', 'myfield1'];
      expect(generateUniqueFieldName('My Field', existingFields)).toBe(
        'myfield2',
      );
    });
  });

  describe('formatFileSize', () => {
    it('should format kilobytes correctly', () => {
      expect(formatFileSize(1536)).toBe('1.5 KB');
      expect(formatFileSize(1048575)).toBe('1024 KB');
    });

    it('should format megabytes correctly', () => {
      expect(formatFileSize(1073741823)).toBe('1024 MB');
    });
  });

  describe('capitalizeFirst', () => {
    it('should capitalize first letter of lowercase string', () => {
      expect(capitalizeFirst('hello')).toBe('Hello');
    });
  });
});
