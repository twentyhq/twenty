/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SsoConfiguration } from 'src/engine/core-modules/sso/types/sso-configurations.type';

@ObjectType('GetAuthorizationUrlForSSO')
export class GetAuthorizationUrlForSsoDTO {
  @Field(() => String)
  authorizationURL: string;

  @Field(() => String)
  type: SsoConfiguration['type'];

  @Field(() => UUIDScalarType)
  id: string;
}
