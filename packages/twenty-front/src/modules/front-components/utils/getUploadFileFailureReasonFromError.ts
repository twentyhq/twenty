import { type UploadFileFailureReason } from 'twenty-sdk/front-component';
import { CustomError } from 'twenty-shared/utils';

export const getUploadFileFailureReasonFromError = (
  error: unknown,
): UploadFileFailureReason =>
  error instanceof CustomError && error.code === 'FORBIDDEN'
    ? 'permission-denied'
    : 'upload-failed';
