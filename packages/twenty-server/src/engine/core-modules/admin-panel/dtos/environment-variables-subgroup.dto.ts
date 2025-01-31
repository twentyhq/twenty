import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';

import { EnvironmentVariable } from './environment-variable.dto';

registerEnumType(EnvironmentVariablesSubGroup, {
  name: 'EnvironmentVariablesSubGroup',
});

@ObjectType()
export class EnvironmentVariablesSubgroupData {
  @Field(() => [EnvironmentVariable])
  variables: EnvironmentVariable[];

  @Field(() => EnvironmentVariablesSubGroup)
  subgroupName: EnvironmentVariablesSubGroup;
}
