import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';
import { EmailModule } from 'src/engine/core-modules/email/email.module';
import { FileUploadModule } from 'src/engine/core-modules/file/file-upload/file-upload.module';
import { FileModule } from 'src/engine/core-modules/file/file.module';

import { InterIntegration } from 'src/engine/core-modules/inter/integration/inter-integration.entity';
import { InterIntegrationResolver } from 'src/engine/core-modules/inter/integration/inter-integration.resolver';
import { InterIntegrationService } from 'src/engine/core-modules/inter/integration/inter-integration.service';
import { InterResolver } from 'src/engine/core-modules/inter/inter.resolver';
import { InterInstanceService } from 'src/engine/core-modules/inter/services/inter-instance.service';
import { InterWebhookService } from 'src/engine/core-modules/inter/services/inter-webhook.service';
import { InterService } from 'src/engine/core-modules/inter/services/inter.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    FileUploadModule,
    FileModule,
    EmailModule,
    TypeOrmModule.forFeature([InterIntegration, Workspace], 'core'),
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [InterIntegration, Workspace],
          'core',
        ),
        WorkspaceModule,
      ],
    }),
    HttpModule,
  ],
  providers: [
    InterIntegrationResolver,
    InterIntegrationService,
    InterService,
    InterResolver,
    InterInstanceService,
    InterWebhookService,
  ],
  exports: [
    InterIntegrationResolver,
    InterIntegrationService,
    InterService,
    InterResolver,
    InterInstanceService,
    InterWebhookService,
  ],
})
export class InterModule {}
