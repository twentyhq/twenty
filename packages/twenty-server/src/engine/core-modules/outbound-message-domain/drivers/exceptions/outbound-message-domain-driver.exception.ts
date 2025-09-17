import { CustomException } from 'src/utils/custom-exception';

export class OutboundMessageDomainDriverException extends CustomException<OutboundMessageDomainDriverExceptionCode> {}

export enum OutboundMessageDomainDriverExceptionCode {
  NOT_FOUND = 'NOT_FOUND',
  TEMPORARY_ERROR = 'TEMPORARY_ERROR',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  CONFIGURATION_ERROR = 'CONFIGURATION_ERROR',
  UNKNOWN = 'UNKNOWN',
}
