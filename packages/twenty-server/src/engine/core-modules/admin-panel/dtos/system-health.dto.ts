import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';

@ObjectType('SystemHealthService')
export class SystemHealthServiceDTO {
  @Field(() => HealthIndicatorId)
  id: HealthIndicatorId;

  @Field(() => String)
  label: string;

  @Field(() => AdminPanelHealthServiceStatus)
  status: AdminPanelHealthServiceStatus;
}

@ObjectType('SystemHealth')
export class SystemHealthDTO {
  @Field(() => [SystemHealthServiceDTO])
  services: SystemHealthServiceDTO[];
}
