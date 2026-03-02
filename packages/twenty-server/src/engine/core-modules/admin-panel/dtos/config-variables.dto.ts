import { Field, ObjectType } from '@nestjs/graphql';

import { ConfigVariablesGroupDataDTO } from 'src/engine/core-modules/admin-panel/dtos/config-variables-group.dto';

@ObjectType('ConfigVariables')
export class ConfigVariablesDTO {
  @Field(() => [ConfigVariablesGroupDataDTO])
  groups: ConfigVariablesGroupDataDTO[];
}
