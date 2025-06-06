import { computeMetadataNameFromLabel } from '~/pages/settings/data-model/utils/compute-metadata-name-from-label.utils';
import * as reservedFields from '~/pages/settings/import/constants/reservedFieldNames';
import * as reservedPrefixes from '~/pages/settings/import/constants/reservedFieldPrefixes';
import { isReservedFieldName } from '../field.utils';
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
      mockComputeMetadataNameFromLabel.mockImplementation((label) =>
        label.toLowerCase().replace(/\s/g, ''),
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
