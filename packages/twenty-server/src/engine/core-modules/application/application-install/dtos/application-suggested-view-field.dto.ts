import { Field, Float, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('ApplicationSuggestedViewField')
export class ApplicationSuggestedViewFieldDTO {
  @Field(() => UUIDScalarType)
  universalIdentifier: string;

  @Field(() => UUIDScalarType)
  viewId: string;

  @Field(() => UUIDScalarType)
  objectMetadataId: string;

  @Field(() => UUIDScalarType)
  fieldMetadataId: string;

  @Field(() => Float)
  position: number;
}
