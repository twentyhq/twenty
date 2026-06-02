import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationInstallModule } from 'src/engine/core-modules/application/application-install/application-install.module';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { PreInstalledAppsService } from 'src/engine/core-modules/application/pre-installed-apps/pre-installed-apps.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([ApplicationRegistrationEntity]),
    ApplicationInstallModule,
  ],
  providers: [PreInstalledAppsService],
  exports: [PreInstalledAppsService],
})
export class PreInstalledAppsModule {}
