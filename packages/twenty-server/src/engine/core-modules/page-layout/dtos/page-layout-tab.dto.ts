import { Field, Float, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('PageLayoutTab')
export class PageLayoutTabDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field({ nullable: false })
  title: string;

  @Field(() => Float, { nullable: false, defaultValue: 0 })
  position: number;

  @Field(() => UUIDScalarType, { nullable: false })
  pageLayoutId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => Date, { nullable: true })
  deletedAt?: Date | null;
}
