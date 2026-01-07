import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

import {
  EmailingDomainDriver,
  EmailingDomainStatus,
} from 'src/engine/core-modules/emailing-domain/drivers/types/emailing-domain';
import { VerificationRecord } from 'src/engine/core-modules/emailing-domain/drivers/types/verifications-record';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/workspace-sync/types/workspace-related-entity';

@Entity({ name: 'emailingDomain', schema: 'core' })
@ObjectType('EmailingDomain')
@Unique('IDX_EMAILING_DOMAIN_DOMAIN_WORKSPACE_ID_UNIQUE', [
  'domain',
  'workspaceId',
])
export class EmailingDomainEntity extends WorkspaceRelatedEntity {
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
    enum: Object.values(EmailingDomainDriver),
    nullable: false,
  })
  driver: EmailingDomainDriver;

  @Column({
    type: 'enum',
    enum: Object.values(EmailingDomainStatus),
    default: EmailingDomainStatus.PENDING,
    nullable: false,
  })
  status: EmailingDomainStatus;

  @Column({ type: 'jsonb', nullable: true })
  verificationRecords: VerificationRecord[];

  @Column({ type: 'timestamptz', nullable: true })
  verifiedAt: Date | null;
}
