import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { ApplicationHealthStatus } from 'twenty-shared/application';

registerEnumType(ApplicationHealthStatus, {
  name: 'ApplicationHealthStatus',
});

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
  title: string | null;

  @Field(() => String, { nullable: true })
  description: string | null;

  @Field(() => ApplicationHealthCheckActionDTO, { nullable: true })
  action: ApplicationHealthCheckActionDTO | null;
}
