import { Module } from '@nestjs/common';

import { ApplicationKeyValueStoreResolver } from 'src/engine/core-modules/application/key-value-store/application-key-value-store.resolver';
import { ApplicationKeyValueStoreService } from 'src/engine/core-modules/application/key-value-store/services/application-key-value-store.service';

@Module({
  providers: [
    ApplicationKeyValueStoreService,
    ApplicationKeyValueStoreResolver,
  ],
  exports: [ApplicationKeyValueStoreService],
})
export class ApplicationKeyValueStoreModule {}
