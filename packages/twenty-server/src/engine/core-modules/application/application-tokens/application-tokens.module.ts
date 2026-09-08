import { Module } from '@nestjs/common';

import { ApplicationTokensController } from 'src/engine/core-modules/application/application-tokens/application-tokens.controller';
import { RunAsWorkspaceMemberTokenService } from 'src/engine/core-modules/application/application-tokens/services/run-as-workspace-member-token.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { ThrottlerModule } from 'src/engine/core-modules/throttler/throttler.module';
import { UserWorkspaceModule } from 'src/engine/core-modules/user-workspace/user-workspace.module';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';

// TokenModule + WorkspaceCacheStorageModule are pulled in for the controller's
// JwtAuthGuard, on top of TokenModule's ApplicationTokenService doing the
// signing.
@Module({
  imports: [
    TokenModule,
    ThrottlerModule,
    UserWorkspaceModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [ApplicationTokensController],
  providers: [RunAsWorkspaceMemberTokenService],
})
export class ApplicationTokensModule {}
