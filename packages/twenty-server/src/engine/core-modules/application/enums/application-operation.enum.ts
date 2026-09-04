import { registerEnumType } from '@nestjs/graphql';

export enum ApplicationOperation {
  INSTALL = 'INSTALL',
  UPGRADE = 'UPGRADE',
  UNINSTALL = 'UNINSTALL',
}

registerEnumType(ApplicationOperation, {
  name: 'ApplicationOperation',
});
