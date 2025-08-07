import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';

@ObjectType()
export class AdminPanelWorkerQueueHealth {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  queueName: string;

  @Field(() => AdminPanelHealthServiceStatus)
  status: AdminPanelHealthServiceStatus;
}
