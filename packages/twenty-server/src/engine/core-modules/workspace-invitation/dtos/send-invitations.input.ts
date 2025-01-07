import { ArgsType, Field } from '@nestjs/graphql';

import { ArrayUnique, IsArray, IsEmail, IsOptional, IsString } from 'class-validator';

@ArgsType()
export class SendInvitationsInput {
  @Field(() => [String])
  @IsArray()
  @IsEmail({}, { each: true })
  @ArrayUnique()
  emails: string[];

  @Field(() => String)
  @IsOptional()
  @IsString()
  roleId?: string;
}
