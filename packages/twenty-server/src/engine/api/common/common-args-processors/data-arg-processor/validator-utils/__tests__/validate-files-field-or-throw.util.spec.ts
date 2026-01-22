import { validateFilesFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-files-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateFilesFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateFilesFieldOrThrow(null, 'testField', {
        maxNumberOfValues: 10,
      });

      expect(result).toBeNull();
    });

    it('should return the files array when all fields are valid', () => {
      const filesValue = [
        { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 'Document 1' },
        { fileId: '660e8400-e29b-41d4-a716-446655440001', label: 'Document 2' },
      ];
      const result = validateFilesFieldOrThrow(filesValue, 'testField', {
        maxNumberOfValues: 10,
      });

      expect(result).toEqual(filesValue);
    });

    it('should return an empty array when value is an empty array', () => {
      const result = validateFilesFieldOrThrow([], 'testField', {
        maxNumberOfValues: 10,
      });

      expect(result).toEqual([]);
    });

    it('should parse and return valid stringified JSON array', () => {
      const filesValue = [
        { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 'Document 1' },
      ];
      const stringifiedValue = JSON.stringify(filesValue);
      const result = validateFilesFieldOrThrow(stringifiedValue, 'testField', {
        maxNumberOfValues: 10,
      });

      expect(result).toEqual(filesValue);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is an invalid JSON string', () => {
      expect(() =>
        validateFilesFieldOrThrow('not valid json', 'testField', {
          maxNumberOfValues: 10,
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is not an array', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 'test' },
          'testField',
          { maxNumberOfValues: 10 },
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is undefined', () => {
      expect(() =>
        validateFilesFieldOrThrow(undefined, 'testField', {
          maxNumberOfValues: 10,
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when array item is not an object', () => {
      expect(() =>
        validateFilesFieldOrThrow(['not an object'], 'testField', {
          maxNumberOfValues: 10,
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when array item is null', () => {
      expect(() =>
        validateFilesFieldOrThrow([null], 'testField', {
          maxNumberOfValues: 10,
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when fileId key is missing', () => {
      expect(() =>
        validateFilesFieldOrThrow([{ label: 'test' }], 'testField', {
          maxNumberOfValues: 10,
        }),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when label key is missing', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ fileId: '550e8400-e29b-41d4-a716-446655440000' }],
          'testField',
          { maxNumberOfValues: 10 },
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when extra keys are present', () => {
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
          { maxNumberOfValues: 10 },
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when fileId is not a valid UUID', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ fileId: 'not-a-uuid', label: 'test' }],
          'testField',
          { maxNumberOfValues: 10 },
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when fileId is not a string', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ fileId: 12345, label: 'test' }],
          'testField',
          { maxNumberOfValues: 10 },
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when label is not a string', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ fileId: '550e8400-e29b-41d4-a716-446655440000', label: 12345 }],
          'testField',
          { maxNumberOfValues: 10 },
        ),
      ).toThrow(CommonQueryRunnerException);
    });
    it('should throw when max number of files is exceeded', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [
            { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 'test' },
            { fileId: '550e8400-e29b-41d4-a716-446655440001', label: 'test' },
          ],
          'testField',
          { maxNumberOfValues: 1 },
        ),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
