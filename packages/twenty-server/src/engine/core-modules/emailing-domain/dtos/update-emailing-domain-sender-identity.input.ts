import { Field, InputType } from '@nestjs/graphql';

import { IsOptional, IsUUID, MaxLength } from 'class-validator';

@InputType()
export class UpdateEmailingDomainSenderIdentityInput {
  @Field(() => String)
  @IsUUID()
  emailingDomainId: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @MaxLength(255)
  senderDisplayName?: string;
}
