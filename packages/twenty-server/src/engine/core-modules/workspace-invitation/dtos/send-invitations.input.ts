import { ArgsType, Field } from '@nestjs/graphql';

import { ArrayUnique, IsArray, IsEmail } from 'class-validator';

@ArgsType()
export class SendInvitationsInput {
  @Field(() => [String])
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayUnique()
  emails: string[];
}
