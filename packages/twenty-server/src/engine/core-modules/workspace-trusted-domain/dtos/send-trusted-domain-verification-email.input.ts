import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class SendTrustedDomainVerificationEmailInput {
  @Field()
  @IsString()
  email: string;

  @Field()
  @IsString()
  trustedDomainId: string;
}
