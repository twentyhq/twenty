import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AsteriskServerEntity, SIPExtensionEntity, CallLogEntity,
  CallQueueEntity, IVRMenuEntity, DialerCampaignEntity, SIPTrunkEntity,
} from './asterisk.entity';
import { AsteriskService } from './asterisk.service';

@Module({
  imports: [TypeOrmModule.forFeature([
    AsteriskServerEntity, SIPExtensionEntity, CallLogEntity,
    CallQueueEntity, IVRMenuEntity, DialerCampaignEntity, SIPTrunkEntity,
  ])],
  providers: [AsteriskService],
  exports: [AsteriskService],
})
export class AsteriskModule {}
