import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { type FlatEntityFrom } from 'src/engine/metadata-modules/flat-entity/types/flat-entity.type';
import { type ExtractRecordTypeOrmRelationProperties } from 'src/engine/workspace-manager/workspace-migration-v2/types/extract-record-typeorm-relation-properties.type';

export type FeatureFlagEntityRelationProperties =
  ExtractRecordTypeOrmRelationProperties<FeatureFlagEntity, WorkspaceEntity>;

export type FlatFeatureFlag = FlatEntityFrom<
  FeatureFlagEntity,
  FeatureFlagEntityRelationProperties
>;
