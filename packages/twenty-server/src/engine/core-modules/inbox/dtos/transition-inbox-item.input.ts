import { Field, InputType, Int } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

import { INBOX_ITEM_TRANSITION_KINDS } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

  // Null is meaningful here: it gives a queue item back. Absent means the
  // transition is not an assignment at all.
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  toUserWorkspaceId?: string | null;
}
