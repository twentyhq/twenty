import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';

@ObjectType()
export class SystemHealth {
  @Field(() => AdminPanelHealthServiceStatus)
  database: AdminPanelHealthServiceStatus;

  @Field(() => AdminPanelHealthServiceStatus)
  redis: AdminPanelHealthServiceStatus;

  @Field(() => AdminPanelHealthServiceStatus)
  worker: AdminPanelHealthServiceStatus;

  @Field(() => AdminPanelHealthServiceStatus)
  accountSync: AdminPanelHealthServiceStatus;
}
