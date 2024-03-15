import { Module } from '@nestjs/common';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DataSourceModule } from 'src/engine-metadata/data-source/data-source.module';
import { MessageThreadModule } from 'src/business/modules/message/repositories/message-thread/message-thread.module';
import { MessageModule } from 'src/business/modules/message/repositories/message/message.module';
import { ThreadCleanerService } from 'src/business/modules/message/services/thread-cleaner/thread-cleaner.service';

@Module({
  imports: [
    DataSourceModule,
    TypeORMModule,
    MessageThreadModule,
    MessageModule,
  ],
  providers: [ThreadCleanerService],
  exports: [ThreadCleanerService],
})
export class ThreadCleanerModule {}
