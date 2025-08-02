import { CustomException } from 'src/utils/custom-exception';

export class ApiKeyException extends CustomException<ApiKeyExceptionCode> {}

export enum ApiKeyExceptionCode {
  API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  API_KEY_NO_ROLE_ASSIGNED = 'API_KEY_NO_ROLE_ASSIGNED',
}
