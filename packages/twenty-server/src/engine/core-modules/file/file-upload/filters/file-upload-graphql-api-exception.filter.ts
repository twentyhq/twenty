import { Catch, type ExceptionFilter } from '@nestjs/common';

import { assertUnreachable } from 'twenty-shared/utils';

import {
  FileUploadException,
  FileUploadExceptionCode,
} from 'src/engine/core-modules/file/file-upload/file-upload.exception';
import {
  InternalServerError,
  NotFoundError,
  UserInputError,
} from 'src/engine/core-modules/graphql/utils/graphql-errors.util';

@Catch(FileUploadException)
export class FileUploadGraphqlApiExceptionFilter implements ExceptionFilter {
  catch(exception: FileUploadException) {
    switch (exception.code) {
      case FileUploadExceptionCode.BAD_REQUEST:
      case FileUploadExceptionCode.FILE_NOT_UPLOADED:
      case FileUploadExceptionCode.FILE_SIZE_MISMATCH:
      case FileUploadExceptionCode.FILE_TOO_LARGE:
        throw new UserInputError(exception);
      case FileUploadExceptionCode.FILE_NOT_FOUND:
        throw new NotFoundError(exception);
      case FileUploadExceptionCode.STORAGE_TIMEOUT:
      case FileUploadExceptionCode.STORAGE_INCONSISTENT:
        throw new InternalServerError(exception);
      default:
        assertUnreachable(exception.code);
    }
  }
}
