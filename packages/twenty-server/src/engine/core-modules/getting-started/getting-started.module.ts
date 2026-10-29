import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { GettingStartedResolver } from 'src/engine/core-modules/getting-started/getting-started.resolver';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { OnboardingModule } from 'src/engine/core-modules/onboarding/onboarding.module';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { WorkflowVersionEntity } from 'src/engine/core-modules/workflow/entities/workflow-version.entity';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    UserVarsModule,
    ConnectedAccountMetadataModule,
    FeatureFlagModule,
    OnboardingModule,
    PermissionsModule,
    TypeOrmModule.forFeature([ApplicationEntity, WorkflowVersionEntity]),
  ],
  providers: [
    GettingStartedService,
    GettingStartedResolver,
    provideWorkspaceScopedRepository(ApplicationEntity),
    provideWorkspaceScopedRepository(WorkflowVersionEntity),
  ],
  exports: [GettingStartedService],
})
export class GettingStartedModule {}
