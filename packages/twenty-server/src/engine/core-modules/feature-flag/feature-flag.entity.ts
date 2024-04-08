import { Field, ID, ObjectType } from '@nestjs/graphql';

import {
  Entity,
  Unique,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { IDField } from '@ptc-org/nestjs-query-graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

export enum FeatureFlagKeys {
  IsBlocklistEnabled = 'IS_BLOCKLIST_ENABLED',
  IsCalendarEnabled = 'IS_CALENDAR_ENABLED',
  IsEventObjectEnabled = 'IS_EVENT_OBJECT_ENABLED',
  IsAirtableIntegrationEnabled = 'IS_AIRTABLE_INTEGRATION_ENABLED',
  IsPostgreSQLIntegrationEnabled = 'IS_POSTGRESQL_INTEGRATION_ENABLED',
  IsMultiSelectEnabled = 'IS_MULTI_SELECT_ENABLED',
}

@Entity({ name: 'featureFlag', schema: 'core' })
@ObjectType('FeatureFlag')
@Unique('IndexOnKeyAndWorkspaceIdUnique', ['key', 'workspaceId'])
export class FeatureFlagEntity {
  @IDField(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column({ nullable: false, type: 'text' })
  key: FeatureFlagKeys;

  @Field()
  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.featureFlags, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @Field()
  @Column({ nullable: false })
  value: boolean;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
