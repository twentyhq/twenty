import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { SyncableEntity } from 'src/engine/workspace-manager/workspace-sync/interfaces/syncable-entity.interface';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'featureFlag', schema: 'core' })
@ObjectType('FeatureFlag')
@Unique('IDX_FEATURE_FLAG_KEY_WORKSPACE_ID_UNIQUE', ['key', 'workspaceId'])
@Index(['workspaceId', 'universalIdentifier'], {
  unique: true,
})
export class FeatureFlagEntity
  extends SyncableEntity
  implements Required<FeatureFlagEntity>
{
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => FeatureFlagKey)
  @Column({ nullable: false, type: 'text' })
  key: FeatureFlagKey;

  @Field(() => UUIDScalarType)
  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, (workspace) => workspace.featureFlags, {
    onDelete: 'CASCADE',
  })
  workspace: Relation<WorkspaceEntity>;

  @Field()
  @Column({ nullable: false })
  value: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}

registerEnumType(FeatureFlagKey, {
  name: 'FeatureFlagKey',
});
