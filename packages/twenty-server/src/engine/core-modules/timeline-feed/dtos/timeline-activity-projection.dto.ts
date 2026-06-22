import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// An OR clause for the timeline query: inherited activities whose morph target
// column points at one of the related records, scoped to the allowed activity types.
@ObjectType('TimelineActivityProjection')
export class TimelineActivityProjectionDTO {
  @Field(() => String)
  targetColumnName: string;

  @Field(() => [UUIDScalarType])
  recordIds: string[];

  @Field(() => [UUIDScalarType])
  linkedObjectMetadataIds: string[];
}
