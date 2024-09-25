import { Field, ObjectType } from '@nestjs/graphql';

import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';

@ObjectType()
export class FindAvailableSSOIDPOutput {
  @Field(() => String)
  type: SSOConfiguration['type'];

  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;
}
