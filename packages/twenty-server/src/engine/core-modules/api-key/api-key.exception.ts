import { CustomException } from 'src/utils/custom-exception';

export class ApiKeyException extends CustomException {
  declare code: ApiKeyExceptionCode;
  constructor(
    message: string,
    code: ApiKeyExceptionCode,
    { userFriendlyMessage }: { userFriendlyMessage?: string } = {},
  ) {
    super(message, code, userFriendlyMessage);
  }
}

export enum ApiKeyExceptionCode {
  API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
}
