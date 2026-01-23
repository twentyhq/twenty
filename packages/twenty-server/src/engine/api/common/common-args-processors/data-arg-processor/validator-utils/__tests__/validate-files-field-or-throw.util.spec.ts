import { validateFilesFieldOrThrow } from 'src/engine/api/common/common-args-processors/data-arg-processor/validator-utils/validate-files-field-or-throw.util';
import { CommonQueryRunnerException } from 'src/engine/api/common/common-query-runners/errors/common-query-runner.exception';

describe('validateFilesFieldOrThrow', () => {
  describe('valid inputs', () => {
    it('should return null when value is null', () => {
      const result = validateFilesFieldOrThrow(null, 'testField');

      expect(result).toBeNull();
    });

    it('should return the files input when addFiles is valid', () => {
      const filesValue = {
        addFiles: [
          {
            fileId: '550e8400-e29b-41d4-a716-446655440000',
            label: 'Document 1',
          },
          {
            fileId: '660e8400-e29b-41d4-a716-446655440001',
            label: 'Document 2',
          },
        ],
      };
      const result = validateFilesFieldOrThrow(filesValue, 'testField');

      expect(result).toEqual(filesValue);
    });

    it('should return the files input when removeFiles is valid', () => {
      const filesValue = {
        removeFiles: [
          {
            fileId: '550e8400-e29b-41d4-a716-446655440000',
            label: 'Document 1',
          },
        ],
      };
      const result = validateFilesFieldOrThrow(filesValue, 'testField');

      expect(result).toEqual(filesValue);
    });

    it('should return the files input when both addFiles and removeFiles are valid', () => {
      const filesValue = {
        addFiles: [
          {
            fileId: '550e8400-e29b-41d4-a716-446655440000',
            label: 'Document 1',
          },
        ],
        removeFiles: [
          {
            fileId: '660e8400-e29b-41d4-a716-446655440001',
            label: 'Document 2',
          },
        ],
      };
      const result = validateFilesFieldOrThrow(filesValue, 'testField');

      expect(result).toEqual(filesValue);
    });

    it('should return an empty object when value is an empty object', () => {
      const result = validateFilesFieldOrThrow({}, 'testField');

      expect(result).toEqual({});
    });

    it('should return the files input when addFiles is an empty array', () => {
      const filesValue = { addFiles: [] };
      const result = validateFilesFieldOrThrow(filesValue, 'testField');

      expect(result).toEqual(filesValue);
    });

    it('should parse and return valid stringified JSON', () => {
      const filesValue = {
        addFiles: [
          {
            fileId: '550e8400-e29b-41d4-a716-446655440000',
            label: 'Document 1',
          },
        ],
      };
      const stringifiedValue = JSON.stringify(filesValue);
      const result = validateFilesFieldOrThrow(stringifiedValue, 'testField');

      expect(result).toEqual(filesValue);
    });
  });

  describe('invalid inputs', () => {
    it('should throw when value is an invalid JSON string', () => {
      expect(() =>
        validateFilesFieldOrThrow('not valid json', 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is an array instead of object', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          [{ fileId: '550e8400-e29b-41d4-a716-446655440000', label: 'test' }],
          'testField',
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when value is undefined', () => {
      expect(() => validateFilesFieldOrThrow(undefined, 'testField')).toThrow(
        CommonQueryRunnerException,
      );
    });

    it('should throw when addFiles item is not an object', () => {
      expect(() =>
        validateFilesFieldOrThrow({ addFiles: ['not an object'] }, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when addFiles item is null', () => {
      expect(() =>
        validateFilesFieldOrThrow({ addFiles: [null] }, 'testField'),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when fileId key is missing in addFiles', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          { addFiles: [{ label: 'test' }] },
          'testField',
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when label key is missing in addFiles', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          { addFiles: [{ fileId: '550e8400-e29b-41d4-a716-446655440000' }] },
          'testField',
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when extra keys are present in file item', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          {
            addFiles: [
              {
                fileId: '550e8400-e29b-41d4-a716-446655440000',
                label: 'test',
                extraKey: 'invalid',
              },
            ],
          },
          'testField',
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when extra keys are present in root object', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          {
            addFiles: [],
            invalidKey: 'test',
          },
          'testField',
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when fileId is not a valid UUID', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          { addFiles: [{ fileId: 'not-a-uuid', label: 'test' }] },
          'testField',
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when fileId is not a string', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          { addFiles: [{ fileId: 12345, label: 'test' }] },
          'testField',
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when label is not a string', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          {
            addFiles: [
              { fileId: '550e8400-e29b-41d4-a716-446655440000', label: 12345 },
            ],
          },
          'testField',
        ),
      ).toThrow(CommonQueryRunnerException);
    });

    it('should throw when removeFiles item has invalid fileId', () => {
      expect(() =>
        validateFilesFieldOrThrow(
          { removeFiles: [{ fileId: 'not-a-uuid', label: 'test' }] },
          'testField',
        ),
      ).toThrow(CommonQueryRunnerException);
    });
  });
});
