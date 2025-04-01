import { registerEnumType } from '@nestjs/graphql';

export enum AdminPanelHealthServiceStatus {
  OPERATIONAL = 'OPERATIONAL',
  OUTAGE = 'OUTAGE',
}

registerEnumType(AdminPanelHealthServiceStatus, {
  name: 'AdminPanelHealthServiceStatus',
});
