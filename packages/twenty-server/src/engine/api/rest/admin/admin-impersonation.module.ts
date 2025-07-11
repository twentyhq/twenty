import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AdminImpersonationService } from 'src/engine/core-modules/auth/services/admin-impersonation.service';
import { TokenModule } from 'src/engine/core-modules/auth/token/token.module';
import { JwtModule } from 'src/engine/core-modules/jwt/jwt.module';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceCacheStorageModule } from 'src/engine/workspace-cache-storage/workspace-cache-storage.module';
import { AdminImpersonationController } from './admin-impersonation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Workspace], 'core'),
    JwtModule,
    TokenModule,
    WorkspaceCacheStorageModule,
  ],
  controllers: [AdminImpersonationController],
  providers: [AdminImpersonationService],
})
export class AdminImpersonationModule {}