import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export type ApplicationRegistrationWithConfigurationStatus =
  ApplicationRegistrationEntity & { isConfigured: boolean };

@ObjectType('PaginatedApplicationRegistrations')
export class PaginatedApplicationRegistrationsDTO {
  @Field(() => [ApplicationRegistrationEntity])
  registrations: ApplicationRegistrationWithConfigurationStatus[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
