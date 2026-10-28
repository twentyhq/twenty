import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GettingStartedResolver } from 'src/engine/core-modules/getting-started/getting-started.resolver';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    UserVarsModule,
    ConnectedAccountMetadataModule,
    FeatureFlagModule,
    OnboardingModule,
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
