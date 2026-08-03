import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'personDuplicatePairDecision', schema: 'core' })
@Index(
  'IDX_PERSON_DUPLICATE_PAIR_DECISION_WORKSPACE_PAIR',
  ['workspaceId', 'leftPersonId', 'rightPersonId'],
  { unique: true },
)
@Index('IDX_PERSON_DUPLICATE_PAIR_DECISION_WORKSPACE_ID', ['workspaceId'])
export class PersonDuplicatePairDecisionEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  leftPersonId: string;

  @Column({ type: 'uuid' })
  rightPersonId: string;

  @Column({ type: 'varchar', length: 64 })
  leftFingerprint: string;

  @Column({ type: 'varchar', length: 64 })
  rightFingerprint: string;

  @Column({ type: 'uuid' })
  resolvedByWorkspaceMemberId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
