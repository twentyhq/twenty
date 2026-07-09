import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@ObjectType('AllApplicationRegistrations')
export class AllApplicationRegistrationsDTO {
  @Field(() => [ApplicationRegistrationEntity])
  applicationRegistrations: ApplicationRegistrationEntity[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
