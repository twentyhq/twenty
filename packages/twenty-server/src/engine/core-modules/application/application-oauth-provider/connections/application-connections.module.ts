import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationOAuthProviderEntity } from 'src/engine/core-modules/application/application-oauth-provider/application-oauth-provider.entity';
import { ApplicationConnectionsController } from 'src/engine/core-modules/application/application-oauth-provider/connections/application-connections.controller';
import { ApplicationConnectionsListService } from 'src/engine/core-modules/application/application-oauth-provider/connections/services/application-connections-list.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';

// Top-level consumer: depends on RefreshTokensManagerModule (which itself
// imports the engine-side AppOAuthRefreshModule). Kept separate from
// ApplicationOAuthProviderModule to avoid the import cycle. TokenModule +
// WorkspaceCacheStorageModule are pulled in for the controller's JwtAuthGuard.
@Module({
  imports: [
    TypeOrmModule.forFeature([
      ConnectedAccountEntity,
      ApplicationOAuthProviderEntity,
    ]),
    TokenModule,
    WorkspaceCacheStorageModule,
    RefreshTokensManagerModule,
  ],
  providers: [ApplicationConnectionsListService],
  controllers: [ApplicationConnectionsController],
  exports: [ApplicationConnectionsListService],
})
export class ApplicationConnectionsModule {}
