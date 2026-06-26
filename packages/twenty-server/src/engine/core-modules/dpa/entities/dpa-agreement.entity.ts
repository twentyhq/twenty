import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { IDField } from '@ptc-org/nestjs-query-graphql';
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

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { DpaAgreementType } from 'src/engine/core-modules/dpa/enums/dpa-agreement-type.enum';
import { type DpaRegion } from 'src/engine/core-modules/dpa/types/dpa.types';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

registerEnumType(DpaAgreementType, { name: 'DpaAgreementType' });

// The immutable legal record of a DPA acceptance/execution for a workspace.
// Lives in the core schema (survives independently of the workspace schema) and
// is the source of truth for "which exact template version did this customer
// agree to, when, and as which contracting entity".
//
// The relation is declared explicitly (rather than extending WorkspaceRelatedEntity)
// so the foreign-key name is deterministic and matches the create-table instance
// command — TypeORM's default FK hash (FK_abba2f6707bd2bc18bbd52f3c3e) is
// reproduced in that command.
@Entity({ name: 'dpaAgreement', schema: 'core' })
@Index('IDX_DPA_AGREEMENT_WORKSPACE_ID', ['workspaceId'])
@ObjectType('DpaAgreement')
export class DpaAgreementEntity {
  @IDField(() => UUIDScalarType)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field(() => DpaAgreementType)
  @Column({ type: 'enum', enum: Object.values(DpaAgreementType) })
  type: DpaAgreementType;

  // The template version agreed to — proves what the customer accepted.
  @Field()
  @Column()
  templateVersion: string;

  // Snapshot of the deployment region at execution time ('EU' | 'US').
  @Field()
  @Column({ type: 'varchar' })
  region: DpaRegion;

  // Snapshot of the contracting Processor entity at execution time, so the
  // record remains accurate even if the region config changes later.
  @Field()
  @Column()
  processorEntity: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  customerLegalEntityName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  signatoryName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  signatoryTitle?: string;

  // Reference to the stored executed PDF (FileFolder.Dpa). Null for click-through.
  @Field({ nullable: true })
  @Column({ type: 'uuid', nullable: true })
  signedFileId?: string;

  // Who accepted/executed (null for system-recorded click-through at signup).
  @Column({ type: 'uuid', nullable: true })
  acceptedByUserId?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  acceptedByEmail?: string;

  @Field()
  @Column({ type: 'timestamptz' })
  acceptedAt: Date;

  @Field()
  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Field()
  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ nullable: false, type: 'uuid' })
  workspaceId: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;
}
