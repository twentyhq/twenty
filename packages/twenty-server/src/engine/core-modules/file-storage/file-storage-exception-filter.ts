import { Catch, ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  FileStorageException,
  FileStorageExceptionCode,
} from 'src/engine/core-modules/file-storage/interfaces/file-storage-exception';
import {
  ForbiddenError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(FileStorageException)
export class FileStorageExceptionFilter implements ExceptionFilter {
  catch(exception: FileStorageException) {
    switch (exception.code) {
      case FileStorageExceptionCode.INVALID_EXTENSION:
        throw new UserInputError(exception);
      case FileStorageExceptionCode.ACCESS_DENIED:
        throw new ForbiddenError(exception);
      case FileStorageExceptionCode.FILE_NOT_FOUND:
        throw new NotFoundError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
