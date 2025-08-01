import {
  appendCommonExceptionCode,
  CustomException,
} from 'src/utils/custom-exception';

export class FileException extends CustomException<
  keyof typeof FileExceptionCode
> {}

export const FileExceptionCode = appendCommonExceptionCode({
  UNAUTHENTICATED: 'UNAUTHENTICATED',
  FILE_NOT_FOUND: 'FILE_NOT_FOUND',
} as const);
