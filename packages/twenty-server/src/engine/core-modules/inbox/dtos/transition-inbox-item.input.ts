import { Field, InputType, Int } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

import { INBOX_ITEM_TRANSITION_KINDS } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';

// One input for every transition. GraphQL has no unions on the input side, so
// the kind is validated here and narrowed to the discriminated union before it
// reaches the service.
@InputType()
export class TransitionInboxItemInput {
  @Field(() => String)
  @IsIn(INBOX_ITEM_TRANSITION_KINDS)
  kind: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  outcome?: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  result?: Record<string, unknown>;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  resurfaceInMinutes?: number;
}
