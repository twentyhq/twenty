import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType()
export class PasswordResetToken {
  @Field(() => String)
  passwordResetToken: string;

  @Field(() => Date)
  passwordResetTokenExpiresAt: Date;

  @Field(() => UUIDScalarType)
  workspaceId: string;
}
