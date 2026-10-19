import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
import { WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';
import { BillingCreditGrantEntity } from 'src/engine/core-modules/billing/entities/billing-credit-grant.entity';
import { ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GettingStartedResolver } from 'src/engine/core-modules/getting-started/getting-started.resolver';
import { GettingStartedService } from 'src/engine/core-modules/getting-started/services/getting-started.service';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

@Module({
  imports: [
    UserVarsModule,
    TypeOrmModule.forFeature([
      ConnectedAccountEntity,
      BillingCreditGrantEntity,
      ApplicationEntity,
      WorkflowEntity,
    ]),
  ],
  providers: [
    GettingStartedService,
    GettingStartedResolver,
    provideWorkspaceScopedRepository(BillingCreditGrantEntity),
    provideWorkspaceScopedRepository(ApplicationEntity),
    provideWorkspaceScopedRepository(WorkflowEntity),
  ],
  exports: [GettingStartedService],
})
export class GettingStartedModule {}
