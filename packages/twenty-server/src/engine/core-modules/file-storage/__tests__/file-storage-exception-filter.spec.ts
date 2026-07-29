import { type ArgumentsHost } from '@nestjs/common';

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

const graphqlHost = { getType: () => 'graphql' } as unknown as ArgumentsHost;
const httpHost = { getType: () => 'http' } as unknown as ArgumentsHost;

describe('FileStorageExceptionFilter', () => {
  const filter = new FileStorageExceptionFilter();

  it('should rethrow untouched outside of a GraphQL context', () => {
    const exception = new FileStorageException(
      'test message',
      FileStorageExceptionCode.ACCESS_DENIED,
    );

    expect(() => filter.catch(exception, httpHost)).toThrow(exception);
  });

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

      expect(() => filter.catch(exception, graphqlHost)).toThrow(expectedError);
    },
  );
});
