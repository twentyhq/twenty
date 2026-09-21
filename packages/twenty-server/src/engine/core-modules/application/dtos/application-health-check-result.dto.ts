import { Field, ObjectType } from '@nestjs/graphql';

import { ApplicationHealthStatus } from 'src/engine/core-modules/application/enums/application-health-status.enum';

@ObjectType('ApplicationHealthCheckAction')
export class ApplicationHealthCheckActionDTO {
  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  location: string | null;
}

@ObjectType('ApplicationHealthCheckResult')
export class ApplicationHealthCheckResultDTO {
  @Field(() => ApplicationHealthStatus)
  status: ApplicationHealthStatus;

  @Field(() => String, { nullable: true })
  message: string | null;

  @Field(() => ApplicationHealthCheckActionDTO, { nullable: true })
  action: ApplicationHealthCheckActionDTO | null;
}
