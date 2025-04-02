import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { GraphQLJSON } from 'graphql-type-json';

import { EnvironmentVariablesMetadataOptions } from 'src/engine/core-modules/environment/decorators/environment-variables-metadata.decorator';
import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';

export enum ConfigVarSource {
  DATABASE = 'DATABASE',
  ENVIRONMENT = 'ENVIRONMENT',
  DEFAULT = 'DEFAULT',
}

registerEnumType(ConfigVarSource, {
  name: 'ConfigVarSource',
  description: 'Source of a configuration variable value',
});

registerEnumType(EnvironmentVariablesGroup, {
  name: 'EnvironmentVariablesGroup',
  description: 'Group of environment variables',
});

@ObjectType()
export class ConfigVarMetadata
  implements Partial<EnvironmentVariablesMetadataOptions>
{
  @Field(() => EnvironmentVariablesGroup)
  group: EnvironmentVariablesGroup;

  @Field(() => String)
  description: string;

  @Field(() => Boolean, { nullable: true })
  sensitive?: boolean;

  @Field(() => Boolean, { nullable: true })
  isEnvOnly?: boolean;
}

@ObjectType()
export class ConfigVarObject {
  @Field(() => String)
  key: string;

  @Field(() => GraphQLJSON, { nullable: true })
  value: any;

  @Field(() => ConfigVarMetadata)
  metadata: ConfigVarMetadata;

  @Field(() => ConfigVarSource)
  source: ConfigVarSource;
}
