import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// OAuth-specific runtime config exposed to the frontend. Future credential
// types (PATs, API keys, basic auth) add their own sibling sub-objects on
// ApplicationConnectionProviderDTO — purely additive, never replaces this.
@ObjectType('ApplicationConnectionProviderOAuthConfig')
export class ApplicationConnectionProviderOAuthConfigDTO {
  @Field(() => [String])
  scopes: string[];

  // false when the server admin hasn't filled in the OAuth client_id /
  // client_secret on the application registration. The frontend uses it to
  // disable "Add connection" and surface a "needs server admin" hint.
  @Field()
  isClientCredentialsConfigured: boolean;
}

// The public concept exposed to apps and the frontend: a description of
// how to obtain a Connection (a ConnectedAccount with provider='APP') for
// an external service. Discriminated by `type`. Today only `oauth` is
// supported; new types add new top-level sub-objects (e.g. apiKey).
@ObjectType('ApplicationConnectionProvider')
export class ApplicationConnectionProviderDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field()
  applicationId: string;

  @Field()
  type: 'oauth';

  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => ApplicationConnectionProviderOAuthConfigDTO, { nullable: true })
  oauth: ApplicationConnectionProviderOAuthConfigDTO | null;
}
