import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'approvedAccessDomain', schema: 'core' })
@ObjectType('ApprovedAccessDomain')
@Unique('IDX_APPROVED_ACCESS_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE', [
  'domain',
  'workspaceId',
])
export class ApprovedAccessDomainEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: false })
  domain: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  isValidated: boolean;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(
    () => WorkspaceEntity,
    (workspace) => workspace.approvedAccessDomains,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;
}
