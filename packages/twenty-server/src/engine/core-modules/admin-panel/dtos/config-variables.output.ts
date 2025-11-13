import { Field, ObjectType } from '@nestjs/graphql';

import { ConfigVariablesGroupDataDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variables-group.dto';

@ObjectType('ConfigVariablesOutput')
export class ConfigVariablesOutput {
  @Field(() => [ConfigVariablesGroupDataDTO])
  groups: ConfigVariablesGroupDataDTO[];
}
