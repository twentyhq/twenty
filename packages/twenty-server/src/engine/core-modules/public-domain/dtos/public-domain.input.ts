import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class PublicDomainInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  domain: string;
}
