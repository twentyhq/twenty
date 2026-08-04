import { Module } from '@nestjs/common';

import { ApplicationVendorController } from 'src/engine/core-modules/application/application-vendor/application-vendor.controller';
import { ApplicationVendorService } from 'src/engine/core-modules/application/application-vendor/application-vendor.service';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { FileStorageModule } from 'src/engine/core-modules/file-storage/file-storage.module';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

@Module({
  imports: [ApplicationModule, FileStorageModule, TwentyConfigModule],
  controllers: [ApplicationVendorController],
  providers: [ApplicationVendorService],
})
export class ApplicationVendorModule {}
