import { Field } from '@nestjs/graphql';

import { HealthIndicatorId } from 'src/engine/core-modules/admin-panel/enums/health-indicator-id.enum';

export class HealthIndicatorInput {
  @Field(() => HealthIndicatorId)
  indicatorId: HealthIndicatorId;
}
