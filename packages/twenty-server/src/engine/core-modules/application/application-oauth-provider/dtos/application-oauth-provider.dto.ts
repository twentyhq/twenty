import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationOAuthProvider')
export class ApplicationOAuthProviderDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field()
  applicationId: string;

  @Field()
  name: string;

  @Field()
  displayName: string;

  @Field({ nullable: true })
  icon: string | null;

  @Field(() => [String])
  scopes: string[];
}
