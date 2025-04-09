import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

import { Relation } from 'src/engine/workspace-manager/workspace-sync-metadata/interfaces/relation.interface';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'approvedAccessDomain', schema: 'core' })
@ObjectType()
@Unique('IndexOnDomainAndWorkspaceId', ['domain', 'workspaceId'])
export class ApprovedAccessDomain {
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

  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.approvedAccessDomains, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;
}
