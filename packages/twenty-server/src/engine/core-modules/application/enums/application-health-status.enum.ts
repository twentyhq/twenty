import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationHealthStatus {
  OK = 'OK',
  INFO = 'INFO',
  ERROR = 'ERROR',
  UNKNOWN = 'UNKNOWN',
}

registerEnumType(ApplicationHealthStatus, {
  name: 'ApplicationHealthStatus',
});
