import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

import { ADD_MESSAGE_TRACKING_CONSENT_UPGRADE_COMMAND_NAME } from 'src/database/commands/upgrade-version-command/2-42/add-message-tracking-consent-upgrade-command-name.constant';
import { MessageTrackingConsentDecision } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-decision.type';
import { MessageTrackingConsentSource } from 'src/engine/core-modules/emailing-domain/types/message-tracking-consent-source.type';
import { WasIntroducedInUpgrade } from 'src/engine/core-modules/upgrade/decorators/was-introduced-in-upgrade.decorator';
import { WorkspaceRelatedEntity } from 'src/engine/workspace-manager/types/workspace-related-entity';

@Entity({ name: 'messageTrackingConsent', schema: 'core' })
@WasIntroducedInUpgrade({
  upgradeCommandName: ADD_MESSAGE_TRACKING_CONSENT_UPGRADE_COMMAND_NAME,
})
@Index(
  'IDX_MESSAGE_TRACKING_CONSENT_EMAIL_UNIQUE',
  ['workspaceId', 'emailAddress'],
  { unique: true },
)
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
}
