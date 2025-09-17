import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class DeleteOutboundMessageDomainInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
