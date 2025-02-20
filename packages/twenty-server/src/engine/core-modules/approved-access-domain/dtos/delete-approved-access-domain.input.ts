import { Field, InputType } from '@nestjs/graphql';

import { IsString } from 'class-validator';

@InputType()
export class DeleteApprovedAccessDomainInput {
  @Field()
  @IsString()
  id: string;
}
