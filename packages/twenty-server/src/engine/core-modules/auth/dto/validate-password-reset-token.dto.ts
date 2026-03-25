import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ValidatePasswordResetToken')
export class ValidatePasswordResetTokenDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => Boolean)
  hasPassword: boolean;
}
