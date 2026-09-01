import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationState {
  INSTALLING = 'INSTALLING',
  INSTALLED = 'INSTALLED',
  UPGRADING = 'UPGRADING',
  UNINSTALLING = 'UNINSTALLING',
}

registerEnumType(ApplicationState, {
  name: 'ApplicationState',
});
