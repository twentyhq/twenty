import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelHealthService } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-health-service.dto';
import { MessageChannelSyncJobByStatusCounter } from 'src/engine/core-modules/health/types/message-sync-metrics.types';
@ObjectType()
export class SystemHealth {
  @Field(() => AdminPanelHealthService)
  database: AdminPanelHealthService;

  @Field(() => AdminPanelHealthService)
  redis: AdminPanelHealthService;

  @Field(() => AdminPanelHealthService)
  worker: AdminPanelHealthService;

  @Field(() => MessageChannelSyncJobByStatusCounter)
  messageSync: MessageChannelSyncJobByStatusCounter;
}
