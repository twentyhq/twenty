import { Field, InputType } from '@nestjs/graphql';

import { AggregateOperations } from 'src/engine/api/graphql/graphql-query-runner/constants/aggregate-operations.constant';
import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateViewFieldInput {
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;

  @Field({ nullable: true, defaultValue: true })
  isVisible?: boolean;

  @Field({ nullable: true, defaultValue: 0 })
  size?: number;

  @Field({ nullable: true, defaultValue: 0 })
  position?: number;

  @Field(() => AggregateOperations, { nullable: true })
  aggregateOperation?: AggregateOperations;
}
