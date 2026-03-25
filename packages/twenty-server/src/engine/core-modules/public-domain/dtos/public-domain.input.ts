import { Field, ArgsType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@ArgsType()
export class PublicDomainInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  domain: string;
}
