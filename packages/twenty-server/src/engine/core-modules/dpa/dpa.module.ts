import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { DpaResolver } from 'src/engine/core-modules/dpa/dpa.resolver';
import { DpaAgreementEntity } from 'src/engine/core-modules/dpa/entities/dpa-agreement.entity';
import { DpaRegionService } from 'src/engine/core-modules/dpa/services/dpa-region.service';
import { DpaService } from 'src/engine/core-modules/dpa/services/dpa.service';
import { FileUrlModule } from 'src/engine/core-modules/file/file-url/file-url.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

// FileStorageService and TwentyConfigService are provided by @Global() modules.
@Module({
  imports: [
    TypeOrmModule.forFeature([DpaAgreementEntity]),
    FileUrlModule,
    ApplicationModule,
    PermissionsModule,
  ],
  providers: [DpaService, DpaRegionService, DpaResolver],
  exports: [DpaService, DpaRegionService],
})
export class DpaModule {}
