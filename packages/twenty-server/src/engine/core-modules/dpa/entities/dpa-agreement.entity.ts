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
import { DpaRegion } from 'src/engine/core-modules/dpa/enums/dpa-region.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

registerEnumType(DpaAgreementType, { name: 'DpaAgreementType' });
registerEnumType(DpaRegion, { name: 'DpaRegion' });

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

  @Field()
  @Column()
  templateVersion: string;

  // Stored as varchar (a point-in-time snapshot, kept flexible) but exposed as the DpaRegion GraphQL enum.
  @Field(() => DpaRegion)
  @Column({ type: 'varchar' })
  region: DpaRegion;

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

  @Field({ nullable: true })
  @Column({ type: 'uuid', nullable: true })
  signedFileId?: string;

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
