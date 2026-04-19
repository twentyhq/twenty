/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SsoConfiguration } from 'src/engine/core-modules/Sso/types/SsoConfigurations.type';

@ObjectType('GetAuthorizationUrlForSso')
export class GetAuthorizationUrlForSsoDTO {
  @Field(() => String)
  authorizationURL: string;

  @Field(() => String)
  type: SsoConfiguration['type'];

  @Field(() => UUIDScalarType)
  id: string;
}
