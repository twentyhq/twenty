import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
  UpdateDateColumn,
} from 'typeorm';

import { UserSessionEntity } from 'src/engine/core-modules/user-session/user-session.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Entity({ name: 'webPushSubscription', schema: 'core' })
@Index(
  'IDX_WEB_PUSH_SUBSCRIPTION_WORKSPACE_ID_ENDPOINT_UNIQUE',
  ['workspaceId', 'endpoint'],
  {
    unique: true,
  },
)
export class WebPushSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WorkspaceEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Relation<WorkspaceEntity>;

  @Column({ type: 'uuid' })
  workspaceId: string;

  @Column({ type: 'varchar' })
  endpoint: string;

  @Column({ type: 'varchar' })
  browserPublicKey: string;

  @Column({ type: 'varchar' })
  browserAuthSecret: string;

  @Column({ type: 'varchar' })
  vapidPublicKey: string;

  @ManyToOne(() => UserSessionEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userSessionId' })
  userSession: Relation<UserSessionEntity>;

  @Index('IDX_WEB_PUSH_SUBSCRIPTION_USER_SESSION_ID')
  @Column({ type: 'uuid' })
  userSessionId: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;
}
