import { Module } from '@nestjs/common';

import { ApplicationHealthModule } from 'src/engine/core-modules/application/application-health/application-health.module';
import { ApplicationPreferencesResolver } from 'src/engine/core-modules/application/application-preferences/application-preferences.resolver';
import { ApplicationPreferencesService } from 'src/engine/core-modules/application/application-preferences/application-preferences.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ConnectionProviderModule } from 'src/engine/core-modules/application/connection-provider/connection-provider.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ApplicationHealthModule,
    ApplicationModule,
    ApplicationVariableEntityModule,
    ConnectionProviderModule,
    PermissionsModule,
    WorkspaceCacheModule,
  ],
  providers: [ApplicationPreferencesService, ApplicationPreferencesResolver],
})
export class ApplicationPreferencesModule {}
