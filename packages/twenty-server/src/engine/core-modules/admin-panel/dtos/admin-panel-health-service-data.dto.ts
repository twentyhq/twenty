import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelWorkerQueueHealth } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-worker-queue-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';

@ObjectType()
export class AdminPanelHealthServiceData {
  @Field(() => HealthIndicatorId)
  id: HealthIndicatorId;

  @Field(() => String)
  label: string;

  @Field(() => String)
  description: string;

  @Field(() => AdminPanelHealthServiceStatus)
  status: AdminPanelHealthServiceStatus;

  @Field(() => String, { nullable: true })
  errorMessage?: string;
  @Field(() => String, { nullable: true })
  details?: string;

  @Field(() => [AdminPanelWorkerQueueHealth], { nullable: true })
  queues?: AdminPanelWorkerQueueHealth[];
}
