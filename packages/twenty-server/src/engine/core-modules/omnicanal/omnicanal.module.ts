import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppConfigEntity, WhatsAppMessageEntity } from './whatsapp.entity';
import { WhatsAppService } from './whatsapp.service';
import { SMSConfigEntity, SMSLogEntity } from './sms.entity';
import { EmailSequenceEntity, SequenceStepEntity } from './sequence.entity';
import { SequenceEnrollmentEntity } from './sequence-enrollment.entity';
import { EmailSequenceService } from './sequence.service';
import { SequenceExecutorService } from './sequence-executor.service';
import {
  UnifiedConversationEntity, UnifiedMessageEntity, WhatsAppTemplateEntity,
  ChatWidgetEntity, LinkedInSyncEntity, MeetingSchedulerEntity,
  SocialMonitorEntity, SocialSignalEntity,
} from './unified-inbox.entity';
import { UnifiedInboxService } from './unified-inbox.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsAppConfigEntity,
      WhatsAppMessageEntity,
      SMSConfigEntity,
      SMSLogEntity,
      EmailSequenceEntity,
      SequenceStepEntity,
      SequenceEnrollmentEntity,
      UnifiedConversationEntity,
      UnifiedMessageEntity,
      WhatsAppTemplateEntity,
      ChatWidgetEntity,
      LinkedInSyncEntity,
      MeetingSchedulerEntity,
      SocialMonitorEntity,
      SocialSignalEntity,
    ]),
  ],
  providers: [WhatsAppService, EmailSequenceService, SequenceExecutorService, UnifiedInboxService],
  exports: [WhatsAppService, EmailSequenceService, SequenceExecutorService, UnifiedInboxService],
})
export class OmnicanalModule {}
