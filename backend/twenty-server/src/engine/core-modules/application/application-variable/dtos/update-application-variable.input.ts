import { ArgsType, Field } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ArgsType()
export class UpdateApplicationVariableEntityInput {
  @Field(() => String, { nullable: false })
  key: string;

  @Field(() => String, { nullable: false })
  value: string;

  @Field(() => UUIDScalarType, { nullable: false })
  applicationId: string;
}
