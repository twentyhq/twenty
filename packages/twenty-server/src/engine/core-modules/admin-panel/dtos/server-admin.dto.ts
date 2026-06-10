import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ServerAdmin')
export class ServerAdminDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field()
  canAccessFullAdminPanel: boolean;

  @Field()
  canImpersonate: boolean;
}
