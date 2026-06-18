import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationSetupStatus {
  INCOMPLETE = 'INCOMPLETE',
  COMPLETE = 'COMPLETE',
}

registerEnumType(ApplicationSetupStatus, {
  name: 'ApplicationSetupStatus',
});
