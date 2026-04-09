/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('DeleteSso')
export class DeleteSsoDTO {
  @Field(() => UUIDScalarType)
  identityProviderId: string;
}
