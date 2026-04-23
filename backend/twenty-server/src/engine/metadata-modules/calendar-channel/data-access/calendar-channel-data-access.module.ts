import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { CalendarChannelDataAccessService } from 'src/engine/metadata-modules/calendar-channel/data-access/services/calendar-channel-data-access.service';
import { CalendarChannelEntity } from 'src/engine/metadata-modules/calendar-channel/entities/calendar-channel.entity';
import { ConnectedAccountDataAccessModule } from 'src/engine/metadata-modules/connected-account/data-access/connected-account-data-access.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CalendarChannelEntity]),
    FeatureFlagModule,
    ConnectedAccountDataAccessModule,
  ],
  providers: [CalendarChannelDataAccessService],
  exports: [CalendarChannelDataAccessService],
})
export class CalendarChannelDataAccessModule {}
