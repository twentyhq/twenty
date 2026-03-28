import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ImportJobEntity } from 'src/engine/core-modules/import-job/entities/import-job.entity';
import { ImportJobResolver } from 'src/engine/core-modules/import-job/import-job.resolver';
import { ImportJobService } from 'src/engine/core-modules/import-job/import-job.service';
import { ImportJobProcessor } from 'src/engine/core-modules/import-job/jobs/import-job.processor';
import { SubscriptionsModule } from 'src/engine/subscriptions/subscriptions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImportJobEntity], 'core'),
    SubscriptionsModule,
  ],
  providers: [ImportJobService, ImportJobResolver, ImportJobProcessor],
  exports: [ImportJobService],
})
export class ImportJobModule {}
