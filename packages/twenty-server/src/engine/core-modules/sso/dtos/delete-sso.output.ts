/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType()
export class DeleteSsoOutput {
  @Field(() => UUIDScalarType)
  identityProviderId: string;
}
