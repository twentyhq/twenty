/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { KeyValuePair } from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { WhatsappIntegration } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.entity';
import { WhatsappIntegrationResolver } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.resolver';
import { WhatsappIntegrationService } from 'src/engine/core-modules/meta/whatsapp/integration/whatsapp-integration.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature(
          [WhatsappIntegration, Workspace],
          'core',
        ),
        TypeORMModule,
      ],
    }),
    WorkspaceModule,
    NestjsQueryTypeOrmModule.forFeature([ObjectMetadataEntity], 'metadata'),
    TypeOrmModule.forFeature([KeyValuePair], 'core'),
  ],
  exports: [],
  providers: [
    TypeORMService,
    WhatsappIntegrationService,
    WhatsappIntegrationResolver,
  ],
})
export class MetaModule {}
