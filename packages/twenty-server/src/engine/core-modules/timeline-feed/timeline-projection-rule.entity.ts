import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'timelineProjectionRule', schema: 'core' })
@ObjectType('TimelineProjectionRule')
export class TimelineProjectionRuleEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'uuid' })
  anchorObjectMetadataId: string;

  @Column({ type: 'uuid' })
  sourceObjectMetadataId: string;

  @Column({ type: 'uuid', array: true })
  linkedObjectMetadataIds: string[];
}
