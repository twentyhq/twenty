import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

import { EnvironmentVariable } from './environment-variable.dto';

registerEnumType(EnvironmentVariablesGroup, {
  name: 'EnvironmentVariablesGroup',
});

@ObjectType()
export class EnvironmentVariablesGroupData {
  @Field(() => [EnvironmentVariable])
  variables: EnvironmentVariable[];

  @Field(() => EnvironmentVariablesGroup)
  name: EnvironmentVariablesGroup;

  @Field(() => String, { defaultValue: '' })
  description: string;

  @Field(() => Boolean, { defaultValue: false })
  isHiddenOnLoad: boolean;
}
