import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'personRecordMerge', schema: 'core' })
@Index('IDX_PERSON_RECORD_MERGE_WORKSPACE_ID', ['workspaceId'])
@Index('IDX_PERSON_RECORD_MERGE_SOURCE_PERSON_ID', [
  'workspaceId',
  'sourcePersonId',
])
@Index('IDX_PERSON_RECORD_MERGE_TARGET_PERSON_ID', [
  'workspaceId',
  'targetPersonId',
])
export class PersonRecordMergeEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  sourcePersonId: string;

  @Column({ type: 'uuid' })
  targetPersonId: string;

  @Column({ type: 'uuid', nullable: true })
  mergedByWorkspaceMemberId: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;
}
