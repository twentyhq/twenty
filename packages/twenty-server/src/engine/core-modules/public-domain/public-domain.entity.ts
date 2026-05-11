import { ObjectType } from '@nestjs/graphql';

import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  type Relation,
  UpdateDateColumn,
} from 'typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'publicDomain', schema: 'core' })
@ObjectType('PublicDomain')
@Index('IDX_PUBLIC_DOMAIN_APPLICATION_ID', ['applicationId'])
export class PublicDomainEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: false, unique: true })
  domain: string;

  @Column({ type: 'boolean', default: false, nullable: false })
  isValidated: boolean;

  @Column({ type: 'uuid', nullable: true })
  applicationId: string | null;

  @ManyToOne(() => ApplicationEntity, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'applicationId' })
  application: Relation<ApplicationEntity> | null;
}
