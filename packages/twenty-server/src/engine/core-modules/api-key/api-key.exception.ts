import { CustomException } from 'src/utils/custom-exception';

export class ApiKeyException extends CustomException<ApiKeyExceptionCode> {}

export enum ApiKeyExceptionCode {
  API_KEY_NOT_FOUND = 'API_KEY_NOT_FOUND',
  API_KEY_REVOKED = 'API_KEY_REVOKED',
  API_KEY_EXPIRED = 'API_KEY_EXPIRED',
  API_KEY_NO_ROLE_ASSIGNED = 'API_KEY_NO_ROLE_ASSIGNED',
  ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS = 'ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS',
}
