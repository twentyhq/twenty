import { Field, ObjectType } from '@nestjs/graphql';

import { IdpType } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@ObjectType()
export class SetupSsoOutput {
  @Field(() => String)
  id: string;

  @Field(() => IdpType)
  type: string;

  @Field(() => String)
  issue: string;
}
