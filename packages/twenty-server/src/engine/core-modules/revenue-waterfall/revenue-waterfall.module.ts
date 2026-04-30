import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RevenueWaterfallEntity, BookingEntryEntity, ChurnEntryEntity, ExpansionEntryEntity } from './revenue-waterfall.entity';
import { RevenueWaterfallService } from './revenue-waterfall.service';
import { RevenueWaterfallResolver } from './revenue-waterfall.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([RevenueWaterfallEntity, BookingEntryEntity, ChurnEntryEntity, ExpansionEntryEntity])],
  providers: [RevenueWaterfallService, RevenueWaterfallResolver],
  exports: [RevenueWaterfallService],
})
export class RevenueWaterfallModule {}
