import { validateFilesFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-files-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateFilesFieldOrThrow', () => {
  const mockSettings = { maxNumberOfValues: 10 };

  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateFilesFieldOrThrow(null, 'testField', mockSettings);

      expect(result).toBeNull();
    });

    it('should return the files array when value is valid', () => {
      const filesValue = [
        {
          fileId: '550e8400-e29b-41d4-a716-446655440000',
          label: 'Document 1',
        },
        {
          fileId: '660e8400-e29b-41d4-a716-446655440001',
          label: 'Document 2',
        },
      ];
      const result = validateFilesFieldOrThrow(
        filesValue,
        'testField',
        mockSettings,
      );

      expect(result).toEqual(filesValue);
    });

    it('should return an empty array when value is an empty array', () => {
      const result = validateFilesFieldOrThrow([], 'testField', mockSettings);

      expect(result).toEqual([]);
    });

    it('should parse and return valid stringified JSON array', () => {
      const filesValue = [
        {
          fileId: '550e8400-e29b-41d4-a716-446655440000',
          label: 'Document 1',
        },
      ];
      const stringifiedValue = JSON.stringify(filesValue);
      const result = validateFilesFieldOrThrow(
        stringifiedValue,
        'testField',
        mockSettings,
      );

      expect(result).toEqual(filesValue);
    });

    it('should accept files array up to max limit', () => {
      const filesValue = Array.from({ length: 10 }, (_, index) => ({
        fileId: `550e8400-e29b-41d4-a716-44665544000${index}`,
        label: `Document ${index}`,
      }));
      const result = validateFilesFieldOrThrow(
        filesValue,
        'testField',
        mockSettings,
      );

      expect(result).toEqual(filesValue);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is an invalid JSON string', () => {
      expect(() =>
        validateFilesFieldOrThrow('not valid json', 'testField', mockSettings),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is an object instead of array', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 'test' },
          'testField',
          mockSettings,
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when array item is not an object', () => {
      expect(() =>
        validateFilesFieldOrThrow(['not an object'], 'testField', mockSettings),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when array item is null', () => {
      expect(() =>
        validateFilesFieldOrThrow([null], 'testField', mockSettings),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when fileId key is missing', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ label: 'test' }],
          'testField',
          mockSettings,
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when label key is missing', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ fileId: '550e8400-e29b-41d4-a716-446655440000' }],
          'testField',
          mockSettings,
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when extra keys are present in file item', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [
            {
              fileId: '550e8400-e29b-41d4-a716-446655440000',
              label: 'test',
              extraKey: 'invalid',
            },
          ],
          'testField',
          mockSettings,
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when fileId is not a valid UUID', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ fileId: 'not-a-uuid', label: 'test' }],
          'testField',
          mockSettings,
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when fileId is not a string', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ fileId: 12345, label: 'test' }],
          'testField',
          mockSettings,
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when label is not a string', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ fileId: '550e8400-e29b-41d4-a716-446655440000', label: 12345 }],
          'testField',
          mockSettings,
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when number of files exceeds max limit', () => {
      const filesValue = Array.from({ length: 11 }, (_, index) => ({
        fileId: `550e8400-e29b-41d4-a716-44665544000${index}`,
        label: `Document ${index}`,
      }));

      expect(() =>
        validateFilesFieldOrThrow(filesValue, 'testField', mockSettings),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
