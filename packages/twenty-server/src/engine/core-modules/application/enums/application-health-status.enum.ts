import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationHealthStatus {
  OK = 'OK',
  WARNING = 'WARNING',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(ApplicationHealthStatus, {
  name: 'ApplicationHealthStatus',
});
