import { Field, ObjectType } from '@nestjs/graphql';

import { AdminPanelHealthServiceStatus } from 'src/engine/core-modules/admin-panel/enums/admin-panel-health-service-status.enum';
import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';

@ObjectType()
export class SystemHealthService {
  @Field(() => HealthIndicatorId)
  id: HealthIndicatorId;

  @Field(() => String)
  label: string;

  @Field(() => AdminPanelHealthServiceStatus)
  status: AdminPanelHealthServiceStatus;
}

@ObjectType()
export class SystemHealth {
  @Field(() => [SystemHealthService])
  services: SystemHealthService[];
}
