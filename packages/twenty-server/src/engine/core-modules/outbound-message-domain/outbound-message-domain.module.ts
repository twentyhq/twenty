import { Module } from '@nestjs/common';

import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { AwsSesClientProvider } from 'src/engine/core-modules/outbound-message-domain/drivers/aws-ses/providers/aws-ses-client.provider';
import { AwsSesHandleErrorService } from 'src/engine/core-modules/outbound-message-domain/drivers/aws-ses/services/aws-ses-handle-error.service';
import { OutboundMessageDomainDriverFactory } from 'src/engine/core-modules/outbound-message-domain/drivers/outbound-message-domain-driver.factory';
import { OutboundMessageDomain } from 'src/engine/core-modules/outbound-message-domain/outbound-message-domain.entity';
import { OutboundMessageDomainResolver } from 'src/engine/core-modules/outbound-message-domain/outbound-message-domain.resolver';
import { OutboundMessageDomainService } from 'src/engine/core-modules/outbound-message-domain/services/outbound-message-domain.service';

@Module({
  imports: [
    NestjsQueryTypeOrmModule.forFeature([OutboundMessageDomain], 'core'),
  ],
  exports: [OutboundMessageDomainService],
  providers: [
    OutboundMessageDomainService,
    OutboundMessageDomainResolver,
    OutboundMessageDomainDriverFactory,
    AwsSesClientProvider,
    AwsSesHandleErrorService,
  ],
})
export class OutboundMessageDomainModule {}
