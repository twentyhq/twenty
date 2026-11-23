import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationRegistrationSourceType {
  NPM = 'npm',
  TARBALL = 'tarball',
  LOCAL = 'local',
  OAUTH_ONLY = 'oauth-only',
  BUNDLED = 'bundled',
}

registerEnumType(ApplicationRegistrationSourceType, {
  name: 'ApplicationRegistrationSourceType',
});
