import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

@ObjectType('PaginatedApplicationRegistrations')
export class PaginatedApplicationRegistrationsDTO {
  @Field(() => [ApplicationRegistrationEntity])
  registrations: ApplicationRegistrationEntity[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
