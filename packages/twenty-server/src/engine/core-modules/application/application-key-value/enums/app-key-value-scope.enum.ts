import { registerEnumType } from '@nestjs/graphql';

export enum AppKeyValueScope {
  INSTALL = 'INSTALL',
  GLOBAL = 'GLOBAL',
}

registerEnumType(AppKeyValueScope, {
  name: 'AppKeyValueScope',
  description:
    'INSTALL entries are private to one workspace install of the application. GLOBAL entries are shared across every install: the value is always the claiming workspaceId and only that workspace can overwrite or delete the key.',
});
