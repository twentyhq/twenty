import { UnauthorizedException } from '@nestjs/common';
import { Field, Float, HideField, Int, ObjectType } from '@nestjs/graphql';

import {
  Authorize,
  FilterableField,
  IDField,
} from '@ptc-org/nestjs-query-graphql';
import { isDefined } from 'twenty-shared/utils';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request';

@ObjectType('AgentChatThread')
@Authorize({
  authorize: (context: { req?: AuthenticatedRequest }) => {
    const userWorkspaceId = context?.req?.userWorkspaceId;

    if (!isDefined(userWorkspaceId)) {
      throw new UnauthorizedException(
        'userWorkspaceId is required to query chat threads',
      );
    }

    return { userWorkspaceId: { eq: userWorkspaceId } };
  },
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
