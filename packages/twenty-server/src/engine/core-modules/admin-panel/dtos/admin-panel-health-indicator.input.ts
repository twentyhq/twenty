import { Field } from '@nestjs/graphql';

import { HealthIndicatorId } from 'src/engine/core-modules/health/enums/health-indicator-id.enum';

export class HealthIndicatorInput {
  @Field(() => HealthIndicatorId)
  indicatorId: HealthIndicatorId;
}
