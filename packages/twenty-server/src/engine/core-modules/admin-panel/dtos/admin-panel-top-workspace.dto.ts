import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('AdminPanelTopWorkspace')
export class AdminPanelTopWorkspaceDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  logoUrl?: string | null;

  @Field(() => String)
  name: string;

  @Field(() => Int)
  totalUsers: number;

  @Field(() => String)
  subdomain: string;
}
