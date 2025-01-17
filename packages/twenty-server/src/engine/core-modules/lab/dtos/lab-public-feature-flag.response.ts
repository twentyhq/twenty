import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

@ObjectType('FeatureFlagMetadata')
class FeatureFlagMetadata {
  @Field()
  label: string;

  @Field()
  description: string;

  @Field()
  imageUrl: string;
}

@ObjectType('LabPublicFeatureFlag')
export class LabPublicFeatureFlagResponse {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => FeatureFlagKey)
  key: FeatureFlagKey;

  @Field()
  workspaceId: string;

  @Field()
  value: boolean;

  @Field(() => FeatureFlagMetadata)
  metadata: FeatureFlagMetadata;
}
