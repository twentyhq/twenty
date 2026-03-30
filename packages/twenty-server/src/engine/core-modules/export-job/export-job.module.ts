import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { ExportJobEntity } from 'src/engine/core-modules/export-job/entities/export-job.entity';
import { ExportJobResolver } from 'src/engine/core-modules/export-job/export-job.resolver';
import { ExportJobService } from 'src/engine/core-modules/export-job/export-job.service';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([ExportJobEntity]),
    SubscriptionsModule,
  ],
  providers: [ExportJobService, ExportJobResolver],
  exports: [ExportJobService],
})
export class ExportJobModule {}
