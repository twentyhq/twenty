import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-health-service.dto';
@ObjectType()
export class SystemHealth {
  @Field(() => AdminPanelHealthService)
  database: AdminPanelHealthService;

  @Field(() => AdminPanelHealthService)
  redis: AdminPanelHealthService;

  @Field(() => AdminPanelHealthService)
  worker: AdminPanelHealthService;

  @Field(() => AdminPanelHealthService)
  messageSync: AdminPanelHealthService;
}
