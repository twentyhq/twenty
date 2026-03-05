import { Module } from '@nestjs/common';

import { ApplicationPackageFetcherService } from 'src/engine/core-modules/application/application-package/application-package-fetcher.service';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [FileStorageModule, TwentyConfigModule],
  providers: [ApplicationPackageFetcherService],
  exports: [ApplicationPackageFetcherService],
})
export class ApplicationPackageModule {}
