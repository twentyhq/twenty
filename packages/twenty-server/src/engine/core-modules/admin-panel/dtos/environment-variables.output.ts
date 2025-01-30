import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';

registerEnumType(EnvironmentVariablesGroup, {
  name: 'EnvironmentVariablesGroup',
});

registerEnumType(EnvironmentVariablesSubGroup, {
  name: 'EnvironmentVariablesSubGroup',
});

@ObjectType()
export class EnvironmentVariable {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  value: string;

  @Field()
  sensitive: boolean;
}

@ObjectType()
export class EnvironmentVariablesSubgroupData {
  @Field(() => [EnvironmentVariable])
  variables: EnvironmentVariable[];

  @Field(() => EnvironmentVariablesSubGroup)
  subgroupName: EnvironmentVariablesSubGroup;
}

@ObjectType()
export class EnvironmentVariablesGroupData {
  @Field(() => [EnvironmentVariable])
  standalone: EnvironmentVariable[];

  @Field(() => [EnvironmentVariablesSubgroupData])
  subgroups: EnvironmentVariablesSubgroupData[];

  @Field(() => EnvironmentVariablesGroup)
  groupName: EnvironmentVariablesGroup;
}

@ObjectType()
export class EnvironmentVariablesOutput {
  @Field(() => [EnvironmentVariablesGroupData])
  groups: EnvironmentVariablesGroupData[];
}
