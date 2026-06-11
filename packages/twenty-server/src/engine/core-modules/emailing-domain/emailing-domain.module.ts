import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { DnsManagerModule } from 'src/engine/core-modules/dns-manager/dns-manager.module';
import { UnsubscribeController } from 'src/engine/core-modules/emailing-domain/controllers/unsubscribe.controller';
import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesRegisterDomainService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-register-domain.service';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { AwsSesSendEmailService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-send-email.service';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { LogEmailingDomainDriver } from 'src/engine/core-modules/emailing-domain/drivers/log/services/log-emailing-domain-driver.service';
import { EmailingDomainEntity } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainResolver } from 'src/engine/core-modules/emailing-domain/emailing-domain.resolver';
import { EmailingDomainWorkspaceCleanupJob } from 'src/engine/core-modules/emailing-domain/jobs/emailing-domain-workspace-cleanup.job';
import { EmailingDomainSenderService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-sender.service';
import { MessageCampaignService } from 'src/engine/core-modules/emailing-domain/services/message-campaign.service';
import { MessageSuppressionService } from 'src/engine/core-modules/emailing-domain/services/message-suppression.service';
import { MessageTopicSubscriptionService } from 'src/engine/core-modules/emailing-domain/services/message-topic-subscription.service';
import { EmailingDomainTenantStatusService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain-tenant-status.service';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';
import { UnsubscribeHostnameService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-hostname.service';
import { UnsubscribeTokenService } from 'src/engine/core-modules/emailing-domain/services/unsubscribe-token.service';
import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';
import { SecretEncryptionModule } from 'src/engine/core-modules/secret-encryption/secret-encryption.module';
import { provideWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/provide-workspace-scoped-repository';
@Module({
  imports: [
    TypeORMModule,
    NestjsQueryTypeOrmModule.forFeature([EmailingDomainEntity]),
    FeatureFlagModule,
    PermissionsModule,
    DnsManagerModule,
    SecretEncryptionModule,
    TypeOrmModule.forFeature([MessageChannelEntity]),
  ],
  controllers: [UnsubscribeController],
  exports: [
    EmailingDomainService,
    EmailingDomainSenderService,
    EmailingDomainTenantStatusService,
    MessageSuppressionService,
    MessageTopicSubscriptionService,
    MessageCampaignService,
    UnsubscribeTokenService,
  ],
  providers: [
    EmailingDomainService,
    EmailingDomainSenderService,
    EmailingDomainTenantStatusService,
    MessageSuppressionService,
    MessageTopicSubscriptionService,
    MessageCampaignService,
    UnsubscribeTokenService,
    UnsubscribeHostnameService,
    EmailingDomainResolver,
    EmailingDomainDriverFactory,
    EmailingDomainWorkspaceCleanupJob,
    AwsSesClientProvider,
    AwsSesHandleErrorService,
    AwsSesRegisterDomainService,
    AwsSesSendEmailService,
    LogEmailingDomainDriver,
    provideWorkspaceScopedRepository(EmailingDomainEntity),
  ],
})
export class EmailingDomainModule {}
