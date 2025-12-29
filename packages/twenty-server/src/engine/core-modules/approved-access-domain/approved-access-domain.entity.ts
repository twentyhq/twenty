import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import { WorkspaceBoundEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-bound-entity';

@Entity({ name: 'approvedAccessDomain', schema: 'core' })
@ObjectType('ApprovedAccessDomain')
@Unique('IDX_APPROVED_ACCESS_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE', [
  'domain',
  'workspaceId',
])
export class ApprovedAccessDomainEntity extends WorkspaceBoundEntity {
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
}
