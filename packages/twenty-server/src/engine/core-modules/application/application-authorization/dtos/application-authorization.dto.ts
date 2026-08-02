import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationAuthorization')
export class ApplicationAuthorizationDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  applicationId: string;

  @Field(() => UUIDScalarType)
  workspaceId: string;

  @Field(() => String)
  applicationName: string;

  @Field(() => [String])
  scopes: string[];

  @Field(() => Date)
  lastAuthorizedAt: Date;

  @Field(() => Date)
  lastUsedAt: Date;

  @Field(() => Date)
  createdAt: Date;
}
