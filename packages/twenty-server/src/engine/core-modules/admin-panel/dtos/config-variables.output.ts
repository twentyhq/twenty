import { Field, ObjectType } from '@nestjs/graphql';

import { ConfigVariablesGroupData } from 'src/engine/core-modules/admin-panel/dtos/config-variables-group.dto';

@ObjectType()
export class ConfigVariablesOutput {
  @Field(() => [ConfigVariablesGroupData])
  groups: ConfigVariablesGroupData[];
}
