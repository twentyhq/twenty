/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';

@ObjectType('GetAuthorizationUrlForSSO')
export class GetAuthorizationUrlForSSODTO {
  @Field(() => String)
  authorizationURL: string;

  @Field(() => String)
  type: SSOConfiguration['type'];

  @Field(() => UUIDScalarType)
  id: string;
}
