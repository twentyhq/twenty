import { ArgsType, Field } from '@nestjs/graphql';

import { ArrayNotEmpty, IsArray, IsEmail } from 'class-validator';

@ArgsType()
export class SendInviteLinkInput {
  @Field(() => [String])
  @IsArray()
  @ArrayNotEmpty()
  @IsEmail({}, { each: true })
  emails: string[];
}
