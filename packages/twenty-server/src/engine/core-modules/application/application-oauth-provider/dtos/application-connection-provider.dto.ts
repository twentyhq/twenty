import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { type ConnectionProviderType } from 'twenty-shared/application';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

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

@ObjectType('ApplicationConnectionProvider')
export class ApplicationConnectionProviderDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field()
  applicationId: string;

  @Field()
  type: ConnectionProviderType;

  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field(() => String, { nullable: true })
  icon: string | null;

  @Field(() => ApplicationConnectionProviderOAuthConfigDTO, { nullable: true })
  oauth: ApplicationConnectionProviderOAuthConfigDTO | null;
}
