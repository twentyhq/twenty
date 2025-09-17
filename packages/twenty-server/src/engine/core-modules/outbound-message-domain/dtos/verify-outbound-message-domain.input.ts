import { Field, InputType } from '@nestjs/graphql';

import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class VerifyOutboundMessageDomainInput {
  @Field(() => String)
  @IsUUID()
  @IsNotEmpty()
  id: string;
}
