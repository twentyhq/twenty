import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { ConfigVariable } from 'src/engine/core-modules/admin-panel/dtos/config-variable.dto';
import { ConfigVariablesGroup } from 'src/engine/core-modules/twenty-config/enums/config-variables-group.enum';

registerEnumType(ConfigVariablesGroup, {
  name: 'ConfigVariablesGroup',
});

@ObjectType()
export class ConfigVariablesGroupData {
  @Field(() => [ConfigVariable])
  variables: ConfigVariable[];

  @Field(() => ConfigVariablesGroup)
  name: ConfigVariablesGroup;

  @Field(() => String, { defaultValue: '' })
  description: string;

  @Field(() => Boolean, { defaultValue: false })
  isHiddenOnLoad: boolean;
}
