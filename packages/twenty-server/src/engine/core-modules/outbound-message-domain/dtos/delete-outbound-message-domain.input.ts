import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsString } from 'class-validator';

@InputType()
export class DeleteOutboundMessageDomainInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  id: string;
}
