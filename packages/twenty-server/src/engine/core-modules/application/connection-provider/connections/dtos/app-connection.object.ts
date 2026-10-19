import { Field, ID, ObjectType } from '@nestjs/graphql';

import { type AppConnection } from 'twenty-shared/application';

import { type ConnectedAccountScope } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountScopeEnum } from 'src/engine/metadata-modules/connected-account/enums/connected-account-scope.enum';

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

  @Field(() => String, { nullable: true })
  externalAccountId: string | null;

  @Field(() => ConnectedAccountScopeEnum)
  scope: ConnectedAccountScope;

  @Field(() => String, { deprecationReason: 'Use scope instead.' })
  visibility: 'user' | 'workspace';

  @Field()
  userWorkspaceId: string;

  @Field(() => String, { nullable: true })
  workspaceMemberId: string | null;

  @Field()
  accessToken: string;

  @Field(() => [String])
  scopes: string[];

  @Field(() => String, { nullable: true })
  authFailedAt: string | null;

  @Field(() => String, { nullable: true })
  authFailedReason: string | null;
}
