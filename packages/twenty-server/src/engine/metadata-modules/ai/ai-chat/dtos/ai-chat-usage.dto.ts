import { Field, ObjectType } from '@nestjs/graphql';
import { GraphQLBigInt } from 'graphql-scalars';

import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { AiChatUserCreditsDTO } from 'src/engine/metadata-modules/ai/ai-chat/dtos/ai-chat-user-credits.dto';

@ObjectType('AiChatUsage')
export class AiChatUsageDTO {
  @Field(() => GraphQLBigInt)
  limitValue: number;

  @Field(() => GraphQLBigInt, { nullable: true })
  consumedValue: number | null;

  @Field(() => Date, { nullable: true })
  periodEnd: Date | null;

  @Field(() => String)
  kind: Exclude<ExhaustedKind, 'userAllowance'>;

  @Field(() => AiChatUserCreditsDTO, { nullable: true })
  userCredits?: AiChatUserCreditsDTO | null;
}
