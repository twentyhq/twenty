import { FileStorageExceptionFilter } from 'src/engine/core-modules/file-storage/file-storage-exception-filter';
import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

describe('FileStorageExceptionFilter', () => {
  const filter = new FileStorageExceptionFilter();

  it.each([
    {
      code: FileStorageExceptionCode.INVALID_EXTENSION,
      expectedError: UserInputError,
    },
    {
      code: FileStorageExceptionCode.ACCESS_DENIED,
      expectedError: ForbiddenError,
    },
    {
      code: FileStorageExceptionCode.FILE_NOT_FOUND,
      expectedError: NotFoundError,
    },
  ])(
    'should map $code to the expected GraphQL error',
    ({ code, expectedError }) => {
      const exception = new FileStorageException('test message', code);

      expect(() => filter.catch(exception)).toThrow(expectedError);
    },
  );
});
