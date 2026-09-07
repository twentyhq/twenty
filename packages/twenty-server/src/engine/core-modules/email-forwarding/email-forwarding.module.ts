import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailForwardingDriverFactory } from 'src/engine/core-modules/email-forwarding/drivers/email-forwarding-driver.factory';
import { GoogleEmailForwardingService } from 'src/engine/core-modules/email-forwarding/drivers/google/services/google-email-forwarding.service';
import { MicrosoftEmailForwardingService } from 'src/engine/core-modules/email-forwarding/drivers/microsoft/services/microsoft-email-forwarding.service';
import { EmailForwardingService } from 'src/engine/core-modules/email-forwarding/services/email-forwarding.service';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { ConnectedAccountTokenEncryptionModule } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.module';
import { RefreshTokensManagerModule } from 'src/modules/connected-account/refresh-tokens-manager/connected-account-refresh-tokens-manager.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ConnectedAccountEntity]),
    ConnectedAccountTokenEncryptionModule,
    RefreshTokensManagerModule,
  ],
  providers: [
    EmailForwardingService,
    EmailForwardingDriverFactory,
    GoogleEmailForwardingService,
    MicrosoftEmailForwardingService,
  ],
  exports: [EmailForwardingService],
})
export class EmailForwardingModule {}
