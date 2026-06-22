import { Field, ObjectType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('TimelineProjectionRule')
export class TimelineProjectionRuleDTO {
  @IDField(() => UUIDScalarType)
  id: string;

  @Field(() => UUIDScalarType)
  anchorObjectMetadataId: string;

  @Field(() => UUIDScalarType)
  sourceObjectMetadataId: string;

  @Field(() => [UUIDScalarType])
  linkedObjectMetadataIds: string[];

  @Field()
  createdAt: Date;
}
