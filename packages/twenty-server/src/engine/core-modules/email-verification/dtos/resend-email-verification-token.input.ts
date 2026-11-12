import { ArgsType, Field } from '@nestjs/graphql';

import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';
import { PARTNER_PATTERN } from 'twenty-shared/constants';

@ArgsType()
export class ResendEmailVerificationTokenInput {
  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Field(() => String, { nullable: true })
  @IsString()
  @IsOptional()
  @Matches(PARTNER_PATTERN)
  affiliatePartnerName?: string;
}
