import { Field, GraphQLISODateTime, InputType } from '@nestjs/graphql';

import { IsDate, IsIn, IsOptional, IsUUID } from 'class-validator';

import { INBOX_ITEM_TRANSITION_KINDS } from 'src/engine/core-modules/inbox/types/inbox-item-transition.type';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// GraphQL has no unions on the input side, so the kind is validated here and
// narrowed to the discriminated union before it reaches the service.
@InputType()
export class TransitionInboxItemInput {
  @Field(() => String)
  @IsIn(INBOX_ITEM_TRANSITION_KINDS)
  kind: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  @IsOptional()
  @IsDate()
  resurfaceAt?: Date;

  // Null is meaningful here: it gives a queue item back. Absent means the
  // transition is not an assignment at all.
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  toUserWorkspaceId?: string | null;

  // Null is meaningful here too: it takes the work out of every shared inbox
  // and leaves it with its assignee.
  @Field(() => UUIDScalarType, { nullable: true })
  @IsOptional()
  @IsUUID()
  toQueueId?: string | null;
}
