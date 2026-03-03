import { Field, Float, HideField, Int, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  FilterableField,
  IDField,
} from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AgentChatThread')
@Authorize({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  authorize: (context: any) => ({
    userWorkspaceId: { eq: context?.req?.userWorkspaceId },
  }),
})
export class AgentChatThreadDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: true })
  title: string;

  @Field(() => Int)
  totalInputTokens: number;

  @Field(() => Int)
  totalOutputTokens: number;

  @Field(() => Int, { nullable: true })
  contextWindowTokens: number | null;

  @Field(() => Int)
  conversationSize: number;

  // Credits are converted from internal precision to display precision
  // (internal / 1000) at the resolver level
  @Field(() => Float)
  totalInputCredits: number;

  @Field(() => Float)
  totalOutputCredits: number;

  @Field()
  createdAt: Date;

  @FilterableField()
  @Field()
  updatedAt: Date;

  @HideField()
  userWorkspaceId: string;
}
