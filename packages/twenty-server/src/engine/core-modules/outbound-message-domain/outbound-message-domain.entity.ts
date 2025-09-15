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

import {
  OutboundMessageDomainDriver,
  OutboundMessageDomainStatus,
} from 'src/engine/core-modules/outbound-message-domain/drivers/types/outbound-message-domain';
import { VerificationRecord } from 'src/engine/core-modules/outbound-message-domain/drivers/types/verifications-record';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'outboundMessageDomain', schema: 'core' })
@ObjectType()
@Unique('IDX_OUTBOUND_MESSAGE_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE', [
  'domain',
  'workspaceId',
])
export class OutboundMessageDomain {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: false })
  domain: string;

  @Column({
    type: 'enum',
    enum: Object.values(OutboundMessageDomainDriver),
    nullable: false,
  })
  driver: OutboundMessageDomainDriver;

  @Column({
    type: 'enum',
    enum: Object.values(OutboundMessageDomainStatus),
    default: OutboundMessageDomainStatus.PENDING,
    nullable: false,
  })
  status: OutboundMessageDomainStatus;

  @Column({ type: 'jsonb', nullable: true })
  verificationRecords: VerificationRecord[];

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;

  @Column()
  workspaceId: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.outboundMessageDomains, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<Workspace>;
}
