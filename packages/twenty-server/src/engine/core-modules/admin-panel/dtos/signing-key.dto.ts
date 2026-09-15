import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType()
export class SigningKeyDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  publicKey: string;

  @Field()
  isCurrent: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date, { nullable: true })
  revokedAt: Date | null;

  @Field(() => Int)
  verifyCountInWindow: number;
}
