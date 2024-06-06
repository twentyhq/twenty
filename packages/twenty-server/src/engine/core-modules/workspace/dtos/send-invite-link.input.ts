import { ArgsType, Field } from '@nestjs/graphql';

import { IsArray, IsEmail } from 'class-validator';

@ArgsType()
export class SendInviteLinkInput {
  @Field(() => [String])
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[];
}
