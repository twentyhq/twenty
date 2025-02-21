import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelWorkerQueueHealth } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-worker-queue-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';

@ObjectType()
export class AdminPanelHealthServiceData {
  @Field(() => String)
  id: string;

  @Field(() => String)
  label: string;

  @Field(() => String)
  description: string;

  @Field(() => AdminPanelHealthServiceStatus)
  status: AdminPanelHealthServiceStatus;

  @Field(() => String, { nullable: true })
  details?: string;

  @Field(() => [AdminPanelWorkerQueueHealth], { nullable: true })
  queues?: AdminPanelWorkerQueueHealth[];
}
