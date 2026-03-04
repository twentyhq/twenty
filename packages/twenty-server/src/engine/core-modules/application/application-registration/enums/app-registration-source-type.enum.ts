import { registerEnumType } from '@nestjs/graphql';

export enum AppRegistrationSourceType {
  NPM = 'npm',
  TARBALL = 'tarball',
  LOCAL = 'local',
}

registerEnumType(AppRegistrationSourceType, {
  name: 'AppRegistrationSourceType',
});
