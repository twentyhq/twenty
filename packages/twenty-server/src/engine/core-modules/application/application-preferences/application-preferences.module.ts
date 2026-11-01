import { Module } from '@nestjs/common';

import { ApplicationPreferencesResolver } from 'src/engine/core-modules/application/application-preferences/application-preferences.resolver';
import { ApplicationPreferencesService } from 'src/engine/core-modules/application/application-preferences/application-preferences.service';
import { ApplicationVariableEntityModule } from 'src/engine/core-modules/application/application-variable/application-variable.module';
import { ApplicationModule } from 'src/engine/core-modules/application/application.module';
import { ConnectionProviderModule } from 'src/engine/core-modules/application/connection-provider/connection-provider.module';
import { PermissionsModule } from 'src/engine/permissions/permissions.module';
import { WorkspaceCacheModule } from 'src/engine/workspace-cache/workspace-cache.module';

@Module({
  imports: [
    ApplicationModule,
    ApplicationVariableEntityModule,
    ConnectionProviderModule,
    PermissionsModule,
    WorkspaceCacheModule,
  ],
  providers: [ApplicationPreferencesService, ApplicationPreferencesResolver],
})
export class ApplicationPreferencesModule {}
