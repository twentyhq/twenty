import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';

@ObjectType('AdminPanelWorkerQueueHealth')
export class AdminPanelWorkerQueueHealthDTO {
  @Field(() => String)
  id: string;

  @Field(() => String)
  queueName: string;

  @Field(() => AdminPanelHealthServiceStatus)
  status: AdminPanelHealthServiceStatus;
}
