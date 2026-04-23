import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import {
  ConfigVariableVersionAction,
  ConfigVariableVersionEntity,
} from 'src/engine/core-modules/twenty-config/versioning/config-variable-version.entity';

registerEnumType(ConfigVariableVersionAction, {
  name: 'ConfigVariableVersionAction',
});

@ObjectType('ConfigVariableVersion')
export class ConfigVariableVersionDTO {
  @Field()
  id: string;

  @Field()
  key: string;

  @Field(() => ConfigVariableVersionAction)
  action: ConfigVariableVersionAction;

  @Field(() => GraphQLJSON, { nullable: true })
  previousValue: ConfigVariableVersionEntity['previousValue'];

  @Field(() => GraphQLJSON, { nullable: true })
  nextValue: ConfigVariableVersionEntity['nextValue'];

  @Field()
  createdAt: Date;
}
