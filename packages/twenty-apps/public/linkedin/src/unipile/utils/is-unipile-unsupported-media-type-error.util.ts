import { UnipileRequestError } from 'src/unipile/utils/request-unipile.util';

const UNIPILE_UNSUPPORTED_MEDIA_TYPE_STATUS = 415;

export const isUnipileUnsupportedMediaTypeError = (error: unknown): boolean =>
  error instanceof UnipileRequestError &&
  error.status === UNIPILE_UNSUPPORTED_MEDIA_TYPE_STATUS;
