import { Field, InputType, Int } from '@nestjs/graphql';

import { IsEnum, IsOptional, Max, Min } from 'class-validator';

import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';

@InputType()
export class FindMessageSuppressionsInput {
  @Field(() => MessageSuppressionReason, { nullable: true })
  @IsOptional()
  @IsEnum(MessageSuppressionReason)
  reason?: MessageSuppressionReason;

  @Field(() => Int, { defaultValue: 30 })
  @Min(1)
  @Max(100)
  limit: number;

  @Field(() => Int, { defaultValue: 0 })
  @Min(0)
  offset: number;
}
