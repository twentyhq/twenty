import { Field, ObjectType } from '@nestjs/graphql';

import { HealthServiceStatus } from 'src/engine/core-modules/health/enums/health-service-status.enum';

@ObjectType()
export class HealthService {
  @Field(() => HealthServiceStatus)
  status: HealthServiceStatus;
}
