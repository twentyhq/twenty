import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { ConfigSource } from 'src/engine/core-modules/twenty-config/enums/config-source.enum';

registerEnumType(ConfigSource, {
  name: 'ConfigSource',
});

@ObjectType()
export class ConfigVariable {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field()
  value: string;

  @Field()
  isSensitive: boolean;

  @Field()
  source: ConfigSource;
}
