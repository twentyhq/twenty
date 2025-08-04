import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { QueueMetricsDataPoint } from 'src/engine/core-modules/admin-panel/dtos/queue-metrics-data-point.dto';

@ObjectType()
export class QueueMetricsSeries {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => [QueueMetricsDataPoint])
  data: QueueMetricsDataPoint[];
}
