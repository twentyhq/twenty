import { Field, ObjectType } from '@nestjs/graphql';

import { ApplicationHealthStatus } from 'src/engine/core-modules/application/enums/application-health-status.enum';

@ObjectType('ApplicationHealthCheckResult')
export class ApplicationHealthCheckResultDTO {
  @Field(() => ApplicationHealthStatus)
  status: ApplicationHealthStatus;

  @Field(() => String, { nullable: true })
  message: string | null;

  @Field(() => String, { nullable: true })
  actionLabel: string | null;
}
