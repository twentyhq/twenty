import { Field, Int, ObjectType } from '@nestjs/graphql';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';

export type AdminApplicationRegistrationListItem =
  ApplicationRegistrationEntity & {
    isConfigured: boolean;
    installCount: number;
  };

@ObjectType('PaginatedApplicationRegistrations')
export class PaginatedApplicationRegistrationsDTO {
  @Field(() => [ApplicationRegistrationEntity])
  registrations: AdminApplicationRegistrationListItem[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
