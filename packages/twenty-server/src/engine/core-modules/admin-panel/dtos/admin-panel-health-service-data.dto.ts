import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelWorkerQueueHealthDTO } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-worker-queue-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';

@ObjectType('AdminPanelHealthServiceData')
export class AdminPanelHealthServiceDataDTO {
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

  @Field(() => [AdminPanelWorkerQueueHealthDTO], { nullable: true })
  queues?: AdminPanelWorkerQueueHealthDTO[];
}
