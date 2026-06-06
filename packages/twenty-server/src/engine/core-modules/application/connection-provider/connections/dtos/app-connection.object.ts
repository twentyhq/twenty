import { Field, ID, ObjectType } from '@nestjs/graphql';

import { type AppConnection } from 'twenty-shared/application';

@ObjectType('AppConnection')
export class AppConnectionObjectDto implements AppConnection {
  @Field(() => ID)
  id: string;

  @Field()
  providerName: string;

  @Field()
  name: string;

  @Field()
  handle: string;

  @Field(() => String)
  visibility: 'user' | 'workspace';

  @Field()
  userWorkspaceId: string;

  @Field()
  accessToken: string;

  @Field(() => [String])
  scopes: string[];

  @Field(() => String, { nullable: true })
  authFailedAt: string | null;
}
