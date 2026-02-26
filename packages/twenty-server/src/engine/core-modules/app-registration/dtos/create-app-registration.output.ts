import { Field, ObjectType } from '@nestjs/graphql';

import { AppRegistrationEntity } from 'src/engine/core-modules/app-registration/app-registration.entity';

@ObjectType()
export class CreateAppRegistrationOutput {
  @Field(() => AppRegistrationEntity)
  appRegistration: AppRegistrationEntity;

  @Field()
  clientSecret: string;
}
