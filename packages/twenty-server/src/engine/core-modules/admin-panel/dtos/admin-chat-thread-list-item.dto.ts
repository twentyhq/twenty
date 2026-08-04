import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AdminChatThreadListItem')
export class AdminChatThreadListItemDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  title: string | null;

  @Field(() => UUIDScalarType)
  workspaceId: string;

  @Field(() => String, { nullable: true })
  workspaceDisplayName: string | null;

  @Field(() => UUIDScalarType)
  userWorkspaceId: string;

  @Field(() => String, { nullable: true })
  userEmail: string | null;

  @Field(() => String, { nullable: true })
  userFirstName: string | null;

  @Field(() => String, { nullable: true })
  userLastName: string | null;

  @Field(() => Int)
  messageCount: number;

  @Field(() => Int)
  userMessageCount: number;

  @Field(() => Boolean)
  hasError: boolean;

  @Field(() => Boolean)
  isOnboardingThread: boolean;

  @Field(() => Date, { nullable: true })
  deletedAt: Date | null;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
