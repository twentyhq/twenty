import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationHealthStatus {
  OK = 'OK',
  SUCCESS = 'SUCCESS',
  INFO = 'INFO',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  NEUTRAL = 'NEUTRAL',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(ApplicationHealthStatus, {
  name: 'ApplicationHealthStatus',
});
