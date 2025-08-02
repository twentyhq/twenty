import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AdminPanelWorkerQueueHealth } from 'src/engine/core-modules/admin-panel/dtos/admin-panel-worker-queue-health.dto';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';

@ObjectType()
export class AdminPanelHealthServiceData {
  @Field(() => UUIDScalarType)
  id: string;

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
