import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailForwardingDriverFactory } from 'src/engine/core-modules/email-forwarding/drivers/email-forwarding-driver.factory';
import { GoogleEmailForwardingService } from 'src/engine/core-modules/email-forwarding/drivers/google/services/google-email-forwarding.service';
import { MicrosoftEmailForwardingService } from 'src/engine/core-modules/email-forwarding/drivers/microsoft/services/microsoft-email-forwarding.service';
import { EmailForwardingProvisioningService } from 'src/engine/core-modules/email-forwarding/services/email-forwarding-provisioning.service';
import { EmailForwardingSetupService } from 'src/engine/core-modules/email-forwarding/services/email-forwarding-setup.service';
import { EmailForwardingService } from 'src/engine/core-modules/email-forwarding/services/email-forwarding.service';
import { UserVarsModule } from 'src/engine/core-modules/user/user-vars/user-vars.module';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { MessageChannelEntity } from 'src/engine/metadata-modules/message-channel/entities/message-channel.entity';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MessageChannelEntity,
      ConnectedAccountEntity,
      UserWorkspaceEntity,
    ]),
    UserVarsModule,
    PermissionsModule,
  ],
  providers: [
    EmailForwardingService,
    EmailForwardingSetupService,
    EmailForwardingProvisioningService,
    EmailForwardingDriverFactory,
    GoogleEmailForwardingService,
    MicrosoftEmailForwardingService,
  ],
  exports: [EmailForwardingSetupService, EmailForwardingProvisioningService],
})
export class EmailForwardingModule {}
