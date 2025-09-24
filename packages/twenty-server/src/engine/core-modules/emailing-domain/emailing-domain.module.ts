import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { AwsSesClientProvider } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/emailing-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { EmailingDomainDriverFactory } from 'src/engine/core-modules/emailing-domain/drivers/emailing-domain-driver.factory';
import { EmailingDomain } from 'src/engine/core-modules/emailing-domain/emailing-domain.entity';
import { EmailingDomainResolver } from 'src/engine/core-modules/emailing-domain/emailing-domain.resolver';
import { EmailingDomainService } from 'src/engine/core-modules/emailing-domain/services/emailing-domain.service';

@Module({
  imports: [
    TypeORMModule,
    NestjsQueryTypeOrmModule.forFeature([EmailingDomain]),
  ],
  exports: [EmailingDomainService],
  providers: [
    EmailingDomainService,
    EmailingDomainResolver,
    EmailingDomainDriverFactory,
    AwsSesClientProvider,
    AwsSesHandleErrorService,
  ],
})
export class EmailingDomainModule {}
