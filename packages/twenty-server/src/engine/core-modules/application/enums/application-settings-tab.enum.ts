import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationSettingsTab {
  GENERAL = 'GENERAL',
  VARIABLES = 'VARIABLES',
  SETTINGS = 'SETTINGS',
}

registerEnumType(ApplicationSettingsTab, {
  name: 'ApplicationSettingsTab',
});
