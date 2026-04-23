import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountDataAccessService } from 'src/engine/metadata-modules/connected-account/data-access/services/connected-account-data-access.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectedAccountEntity, UserWorkspaceEntity]),
    FeatureFlagModule,
  ],
  providers: [ConnectedAccountDataAccessService],
  exports: [ConnectedAccountDataAccessService],
})
export class ConnectedAccountDataAccessModule {}
