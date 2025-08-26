import { Field, InputType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@InputType()
export class CreateViewGroupInput {
  @Field(() => UUIDScalarType, { nullable: true })
  id?: string;

  @Field(() => UUIDScalarType, { nullable: false })
  fieldMetadataId: string;

  @Field({ nullable: true, defaultValue: true })
  isVisible?: boolean;

  @Field({ nullable: false })
  fieldValue: string;

  @Field({ nullable: true, defaultValue: 0 })
  position?: number;

  @Field(() => UUIDScalarType, { nullable: false })
  viewId: string;
}
