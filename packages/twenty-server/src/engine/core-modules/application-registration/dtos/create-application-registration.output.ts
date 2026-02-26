import { Field, ObjectType } from '@nestjs/graphql';

import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application-registration/application-registration.entity';

@ObjectType()
export class CreateApplicationRegistrationOutput {
  @Field(() => ApplicationRegistrationEntity)
  applicationRegistration: ApplicationRegistrationEntity;

  @Field()
  clientSecret: string;
}
