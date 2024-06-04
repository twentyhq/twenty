import { ArgsType, Field } from '@nestjs/graphql';

import { IsEmail, IsNotEmpty } from 'class-validator';

@ArgsType()
export class SendInviteLinkInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsEmail()
  email: string;
}
