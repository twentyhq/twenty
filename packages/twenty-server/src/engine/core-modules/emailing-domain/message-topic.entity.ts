import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MessageTopicVisibility } from 'src/engine/core-modules/emailing-domain/types/message-topic-visibility.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

// An unsubscribe group: an email category recipients can opt out of. Lives in
// core alongside emailingDomain and messageSuppression so the whole consent
// domain (groups + suppressions + the public unsubscribe page) is reachable
// from the unauthenticated webhook/controller paths without a workspace context.
// Curated by the workspace admin through the Settings → Email section.
@Entity({ name: 'messageTopic', schema: 'core' })
@Index('IDX_MESSAGE_TOPIC_WORKSPACE_ID', ['workspaceId'])
export class MessageTopicEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: true })
  name: string | null;

  @Column({ type: 'varchar', nullable: true })
  description: string | null;

  // PUBLIC groups appear on the unsubscribe preferences page; PRIVATE ones are
  // usable as a campaign's unsubscribe scope but hidden from recipients.
  @Column({
    type: 'enum',
    enum: Object.values(MessageTopicVisibility),
    default: MessageTopicVisibility.PRIVATE,
    nullable: false,
  })
  visibility: MessageTopicVisibility;
}
