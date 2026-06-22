import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

// One inherited slice of a record's TimelineActivity feed: activities whose
// morph target column (e.g. targetPersonId) points at a related record, narrowed
// to the activity object types that are allowed to project (notes & tasks). The
// frontend turns each projection into an OR clause on its existing query, so the
// timeline gains inherited rows without losing live updates or the cache.
@ObjectType('TimelineActivityProjection')
export class TimelineActivityProjectionDTO {
  @Field(() => String)
  targetColumnName: string;

  @Field(() => [UUIDScalarType])
  recordIds: string[];

  @Field(() => [UUIDScalarType])
  linkedObjectMetadataIds: string[];
}
