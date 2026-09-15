import { registerEnumType } from '@nestjs/graphql';

export enum AppKeyValueScope {
  WORKSPACE = 'WORKSPACE',
  SERVER = 'SERVER',
}

registerEnumType(AppKeyValueScope, {
  name: 'AppKeyValueScope',
  description:
    'WORKSPACE entries are private to one workspace install of the application. SERVER entries are shared across every install: the value is always the claiming workspaceId and only that workspace can overwrite or delete the key.',
});
