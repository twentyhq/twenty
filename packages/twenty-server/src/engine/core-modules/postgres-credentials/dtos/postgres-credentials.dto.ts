import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('PostgresCredentials')
export class PostgresCredentialsDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field()
  user: string;

  @Field()
  password: string;

  @Field(() => UUIDScalarType)
  workspaceId: string;
}
