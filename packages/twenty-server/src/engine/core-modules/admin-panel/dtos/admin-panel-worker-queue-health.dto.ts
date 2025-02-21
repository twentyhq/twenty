import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { WorkerQueueHealth } from 'src/engine/core-modules/health/types/worker-queue-health.type';

@ObjectType()
export class AdminPanelWorkerQueueHealth extends WorkerQueueHealth {
  @Field(() => String)
  id: string;

  @Field(() => AdminPanelHealthServiceStatus)
  status: AdminPanelHealthServiceStatus;
}
