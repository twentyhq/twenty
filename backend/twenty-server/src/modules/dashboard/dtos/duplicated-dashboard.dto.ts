import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('DuplicatedDashboard')
export class DuplicatedDashboardDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  title: string | null;

  @Field(() => UUIDScalarType, { nullable: true })
  pageLayoutId: string | null;

  @Field(() => Number)
  position: number;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
