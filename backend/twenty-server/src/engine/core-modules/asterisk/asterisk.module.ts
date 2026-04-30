import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  AsteriskServerEntity, SIPExtensionEntity, CallLogEntity,
  CallQueueEntity, IVRMenuEntity, DialerCampaignEntity, SIPTrunkEntity,
} from './asterisk.entity';
import { AsteriskService } from './asterisk.service';
import { AsteriskResolver } from './asterisk.resolver';
import { AsteriskController } from './asterisk.controller';

@Module({
  imports: [TypeOrmModule.forFeature([
    AsteriskServerEntity, SIPExtensionEntity, CallLogEntity,
    CallQueueEntity, IVRMenuEntity, DialerCampaignEntity, SIPTrunkEntity,
  ])],
  controllers: [AsteriskController],
  providers: [AsteriskService, AsteriskResolver],
  exports: [AsteriskService],
})
export class AsteriskModule {}
