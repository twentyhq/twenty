import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { DomainManagerModule } from 'src/engine/core-modules/domain-manager/domain-manager.module';
import { EmailVerificationResolver } from 'src/engine/core-modules/email-verification/email-verification.resolver';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppToken], 'core'),
    EmailModule,
    EnvironmentModule,
    DomainManagerModule,
    UserModule,
  ],
  providers: [EmailVerificationService, EmailVerificationResolver],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
