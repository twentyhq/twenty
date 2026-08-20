import { ArgsType, Field } from '@nestjs/graphql';

import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { EMAIL_REGEX } from 'twenty-shared/utils';

@ArgsType()
export class UpdateUserEmailInput {
  @Field(() => String)
  @IsNotEmpty()
  @MaxLength(255)
  @Matches(EMAIL_REGEX, { message: 'newEmail must be a valid email' })
  newEmail: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  verifyEmailRedirectPath?: string;
}
