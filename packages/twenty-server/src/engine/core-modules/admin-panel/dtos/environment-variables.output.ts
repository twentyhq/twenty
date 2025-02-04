import { Field, ObjectType } from '@nestjs/graphql';

import { EnvironmentVariablesGroupData } from './environment-variables-group.dto';

@ObjectType()
export class EnvironmentVariablesOutput {
  @Field(() => [EnvironmentVariablesGroupData])
  groups: EnvironmentVariablesGroupData[];
}
