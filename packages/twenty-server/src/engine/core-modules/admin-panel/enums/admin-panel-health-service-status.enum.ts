import { registerEnumType } from '@nestjs/graphql';

export enum AdminPanelHealthServiceStatus {
  OPERATIONAL = 'operational',
  OUTAGE = 'outage',
}

registerEnumType(AdminPanelHealthServiceStatus, {
  name: 'AdminPanelHealthServiceStatus',
});
