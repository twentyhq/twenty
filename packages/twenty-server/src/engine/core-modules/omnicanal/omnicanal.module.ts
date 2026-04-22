import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WhatsAppConfigEntity, WhatsAppMessageEntity } from './whatsapp.entity';
import { WhatsAppService } from './whatsapp.service';
import { SMSConfigEntity, SMSLogEntity } from './sms.entity';
import { EmailSequenceEntity, SequenceStepEntity } from './sequence.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WhatsAppConfigEntity,
      WhatsAppMessageEntity,
      SMSConfigEntity,
      SMSLogEntity,
      EmailSequenceEntity,
      SequenceStepEntity,
    ]),
  ],
  providers: [WhatsAppService],
  exports: [WhatsAppService],
})
export class OmnicanalModule {}