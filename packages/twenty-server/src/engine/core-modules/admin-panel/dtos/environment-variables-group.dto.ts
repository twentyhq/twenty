import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

import { EnvironmentVariable } from './environment-variable.dto';
import { EnvironmentVariablesSubgroupData } from './environment-variables-subgroup.dto';

registerEnumType(EnvironmentVariablesGroup, {
  name: 'EnvironmentVariablesGroup',
});

@ObjectType()
export class EnvironmentVariablesGroupData {
  @Field(() => [EnvironmentVariable])
  variables: EnvironmentVariable[];

  @Field(() => [EnvironmentVariablesSubgroupData])
  subgroups: EnvironmentVariablesSubgroupData[];

  @Field(() => EnvironmentVariablesGroup)
  groupName: EnvironmentVariablesGroup;
}
