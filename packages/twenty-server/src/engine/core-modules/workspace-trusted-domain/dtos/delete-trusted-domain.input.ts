import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class DeleteTrustedDomainInput {
  @Field()
  @IsString()
  id: string;
}
