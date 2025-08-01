import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType()
export class ValidatePasswordResetToken {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  email: string;
}
