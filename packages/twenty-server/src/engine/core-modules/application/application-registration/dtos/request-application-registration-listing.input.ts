import { ArgsType, Field } from '@nestjs/graphql';

import { IsEmail, IsUUID } from 'class-validator';

@ArgsType()
export class RequestApplicationRegistrationListingInput {
  @Field(() => String)
  @IsUUID()
  applicationRegistrationId: string;

  // Where the admin's listing decision (approval / rejection / change
  // request) will be sent.
  @Field(() => String)
  @IsEmail()
  contactEmail: string;
}
