import { InputType, Field } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class CreateTrustedDomainInput {
  @Field()
  @IsString()
  domain: string;
}
