import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

@Entity({ name: 'featureFlag', schema: 'core' })
@ObjectType('FeatureFlag')
@Unique('IDX_FEATURE_FLAG_KEY_WORKSPACE_ID_UNIQUE', ['key', 'workspaceId'])
export class FeatureFlagEntity extends WorkspaceRelatedEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => FeatureFlagKey)
  @Column({ nullable: false, type: 'text' })
  key: FeatureFlagKey;

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
