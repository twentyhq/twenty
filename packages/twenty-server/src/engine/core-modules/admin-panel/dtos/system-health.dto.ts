import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelHealthServiceData } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-health-service-data.dto';

@ObjectType()
export class SystemHealth {
  @Field(() => AdminPanelHealthServiceData)
  database: AdminPanelHealthServiceData;

  @Field(() => AdminPanelHealthServiceData)
  redis: AdminPanelHealthServiceData;

  @Field(() => AdminPanelHealthServiceData)
  worker: AdminPanelHealthServiceData;

  @Field(() => AdminPanelHealthServiceData)
  messageSync: AdminPanelHealthServiceData;
}
