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

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'publicDomain', schema: 'core' })
@ObjectType()
@Unique('IDX_PUBLIC_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE', [
  'domain',
  'workspaceId',
])
export class PublicDomain {
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

  @ManyToOne(() => Workspace, (workspace) => workspace.publicDomains, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;
}
