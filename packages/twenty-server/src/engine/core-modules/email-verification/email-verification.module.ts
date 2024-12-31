import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppToken } from 'src/engine/core-modules/app-token/app-token.entity';
import { EmailVerificationResolver } from 'src/engine/core-modules/email-verification/email-verification.resolver';
import { EmailVerificationService } from 'src/engine/core-modules/email-verification/services/email-verification.service';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { EnvironmentModule } from 'src/engine/core-modules/environment/environment.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([AppToken], 'core'),
    EmailModule,
    EnvironmentModule,
  ],
  providers: [EmailVerificationService, EmailVerificationResolver],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
