import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { UnsubscribeController } from 'src/engine/core-modules/emailing-domain/controllers/unsubscribe.controller';
import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesRegisterDomainService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-register-domain.service';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { AwsSesSendEmailService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-send-email.service';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailGroupSuppressedRecipientEntity } from 'src/engine/core-modules/emailing-domain/email-group-suppressed-recipient.entity';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainResolver } from 'src/engine/core-modules/emailing-domain/emailing-domain.resolver';
import { EmailingDomainWorkspaceCleanupJob } from 'src/engine/core-modules/emailing-domain/jobs/emailing-domain-workspace-cleanup.job';
import { EmailGroupSuppressionService } from 'src/engine/core-modules/emailing-domain/services/email-group-suppression.service';
import { EmailingDomainTenantStatusService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-tenant-status.service';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
@Module({
  imports: [
    TypeORMModule,
    NestjsQueryTypeOrmModule.forFeature([
      EmailingDomainEntity,
      EmailGroupSuppressedRecipientEntity,
    ]),
    FeatureFlagModule,
    PermissionsModule,
  ],
  controllers: [UnsubscribeController],
  exports: [
    EmailingDomainService,
    EmailingDomainTenantStatusService,
    EmailGroupSuppressionService,
    UnsubscribeTokenService,
  ],
  providers: [
    EmailingDomainService,
    EmailingDomainTenantStatusService,
    EmailGroupSuppressionService,
    UnsubscribeTokenService,
    EmailingDomainResolver,
    EmailingDomainDriverFactory,
    EmailingDomainWorkspaceCleanupJob,
    AwsSesClientProvider,
    AwsSesHandleErrorService,
    AwsSesRegisterDomainService,
    AwsSesSendEmailService,
    provideWorkspaceScopedRepository(EmailingDomainEntity),
    provideWorkspaceScopedRepository(EmailGroupSuppressedRecipientEntity),
  ],
})
export class EmailingDomainModule {}
