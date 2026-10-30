import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { MarketplaceModule } from 'src/engine/core-modules/application/application-marketplace/marketplace.module';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GettingStartedResolver } from 'src/engine/core-modules/getting-started/getting-started.resolver';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { KeyValuePairModule } from 'src/engine/core-modules/key-value-pair/key-value-pair.module';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    UserVarsModule,
    ConnectedAccountMetadataModule,
    FeatureFlagModule,
    KeyValuePairModule,
    MarketplaceModule,
    PermissionsModule,
    TypeOrmModule.forFeature([ApplicationEntity]),
  ],
  providers: [
    GettingStartedService,
    GettingStartedResolver,
    provideWorkspaceScopedRepository(ApplicationEntity),
  ],
  exports: [GettingStartedService],
})
export class GettingStartedModule {}
