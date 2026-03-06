import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationRegistrationSourceType {
  NPM = 'npm',
  TARBALL = 'tarball',
  LOCAL = 'local',
}

registerEnumType(ApplicationRegistrationSourceType, {
  name: 'ApplicationRegistrationSourceType',
});
