import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { EnvironmentVariablesGroup } from 'src/engine/core-modules/environment/enums/environment-variables-group.enum';
import { EnvironmentVariablesSubGroup } from 'src/engine/core-modules/environment/enums/environment-variables-sub-group.enum';

// Register the enums for GraphQL
registerEnumType(EnvironmentVariablesGroup, {
  name: 'EnvironmentVariablesGroup',
});

registerEnumType(EnvironmentVariablesSubGroup, {
  name: 'EnvironmentVariablesSubGroup',
});

@ObjectType()
class EnvironmentVariableMetadata {
  @Field(() => EnvironmentVariablesGroup)
  group: EnvironmentVariablesGroup;

  @Field(() => EnvironmentVariablesSubGroup, { nullable: true })
  subGroup?: EnvironmentVariablesSubGroup;

  @Field()
  description: string;

  @Field({ nullable: true })
  sensitive?: boolean;
}

@ObjectType()
class EnvironmentVariable {
  @Field()
  key: string;

  @Field(() => String) // Use string as the base type, since all env vars are strings
  value: string;

  @Field(() => EnvironmentVariableMetadata)
  metadata: EnvironmentVariableMetadata;
}

@ObjectType()
export class EnvironmentVariablesOutput {
  @Field(() => [EnvironmentVariable])
  variables: EnvironmentVariable[];
}
