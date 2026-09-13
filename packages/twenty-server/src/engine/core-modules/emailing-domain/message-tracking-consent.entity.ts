import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'messageTrackingConsent', schema: 'core' })
@Index(
  'IDX_MESSAGE_TRACKING_CONSENT_EMAIL_UNIQUE',
  ['workspaceId', 'emailAddress'],
  { unique: true },
)
@Index('IDX_MESSAGE_TRACKING_CONSENT_PERSON_ID', ['workspaceId', 'personId'])
export class MessageTrackingConsentEntity extends WorkspaceRelatedEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updatedAt: Date;

  @Column({ type: 'varchar', nullable: false })
  emailAddress: string;

  @Column({
    type: 'enum',
    enum: Object.values(MessageTrackingConsentDecision),
    nullable: false,
  })
  decision: MessageTrackingConsentDecision;

  @Column({
    type: 'enum',
    enum: Object.values(MessageTrackingConsentSource),
    nullable: false,
  })
  source: MessageTrackingConsentSource;

  @Column({ type: 'uuid', nullable: true })
  personId: string | null;
}
