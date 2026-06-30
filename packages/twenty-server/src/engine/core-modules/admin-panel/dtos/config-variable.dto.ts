import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';
import { ConfigVariableValue } from 'twenty-shared/types';

import { ConfigSource } from 'src/engine/core-modules/twenty-config/enums/config-source.enum';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/enums/config-variable-type.enum';
import { ConfigVariableOptions } from 'src/engine/core-modules/twenty-config/types/config-variable-options.type';

registerEnumType(ConfigSource, {
  name: 'ConfigSource',
});

registerEnumType(ConfigVariableType, {
  name: 'ConfigVariableType',
});

@ObjectType('ConfigVariable')
export class ConfigVariableDTO {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => GraphQLJSON, { nullable: true })
  value: ConfigVariableValue;

  @Field()
  isSensitive: boolean;

  @Field()
  source: ConfigSource;

  @Field()
  isEnvOnly: boolean;

  @Field(() => ConfigVariableType)
  type: ConfigVariableType;

  @Field(() => GraphQLJSON, { nullable: true })
  options?: ConfigVariableOptions;
}
