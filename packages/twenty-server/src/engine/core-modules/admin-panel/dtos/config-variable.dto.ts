import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { ConfigSource } from 'src/engine/core-modules/twenty-config/enums/config-source.enum';
import { ConfigVariableOptions } from 'src/engine/core-modules/twenty-config/types/config-variable-options.type';
import { ConfigVariableType } from 'src/engine/core-modules/twenty-config/types/config-variable-type.type';

registerEnumType(ConfigSource, {
  name: 'ConfigSource',
});

registerEnumType(ConfigVariableType, {
  name: 'ConfigVariableType',
});

@ObjectType()
export class ConfigVariable {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field(() => GraphQLJSON, { nullable: true })
  value: string | number | boolean | string[] | null;

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
