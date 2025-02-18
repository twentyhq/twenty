import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class CreateTrustedDomainInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  domain: string;

  @Field(() => String)
  @IsEmail()
  @IsNotEmpty()
  email: string;
}
