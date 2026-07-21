import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { BillingModule } from 'src/engine/core-modules/billing/billing.module';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesObservabilityService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-observability.service';
import { AwsSesRegisterDomainService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-register-domain.service';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { AwsSesSendEmailService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-send-email.service';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { LogEmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/log/services/log-emailing-domain-driver.service';
import { EmailGroupAccessService } from 'src/engine/core-modules/emailing-domain/services/email-group-access.service';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainResolver } from 'src/engine/core-modules/emailing-domain/emailing-domain.resolver';
import { EmailingDomainWorkspaceCleanupJob } from 'src/engine/core-modules/emailing-domain/jobs/emailing-domain-workspace-cleanup.job';
import { EmailingDomainTenantStatusService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-tenant-status.service';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { UnsubscribeContentService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-content.service';
import { UnsubscribeHostnameService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-hostname.service';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { EnterpriseModule } from 'src/engine/core-modules/enterprise/enterprise.module';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';

@Module({
  imports: [
    TypeORMModule,
    TypeOrmModule.forFeature([WorkspaceEntity, EmailingDomainEntity]),
    FeatureFlagModule,
    PermissionsModule,
    DnsManagerModule,
    SecretEncryptionModule,
    BillingModule,
    EnterpriseModule,
  ],
  exports: [
    EmailingDomainService,
    EmailingDomainTenantStatusService,
    EmailingDomainDriverFactory,
    UnsubscribeTokenService,
    EmailGroupAccessService,
  ],
  providers: [
    EmailGroupAccessService,
    EmailingDomainService,
    EmailingDomainTenantStatusService,
    UnsubscribeTokenService,
    UnsubscribeContentService,
    UnsubscribeHostnameService,
    EmailingDomainResolver,
    EmailingDomainDriverFactory,
    EmailingDomainWorkspaceCleanupJob,
    AwsSesClientProvider,
    AwsSesHandleErrorService,
    AwsSesObservabilityService,
    AwsSesRegisterDomainService,
    AwsSesSendEmailService,
    LogEmailingDomainDriver,
    provideWorkspaceScopedRepository(EmailingDomainEntity),
  ],
})
export class EmailingDomainModule {}
