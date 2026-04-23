import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FeatureFlagModule } from 'src/engine/core-modules/feature-flag/feature-flag.module';
import { ConnectedAccountMetadataModule } from 'src/engine/metadata-modules/connected-account/connected-account-metadata.module';
import { MessageChannelMetadataModule } from 'src/engine/metadata-modules/message-channel/message-channel-metadata.module';
import { MessageFolderEntity } from 'src/engine/metadata-modules/message-folder/entities/message-folder.entity';
import { MessageFolderGraphqlApiExceptionInterceptor } from 'src/engine/metadata-modules/message-folder/interceptors/message-folder-graphql-api-exception.interceptor';
import { MessageFolderMetadataService } from 'src/engine/metadata-modules/message-folder/message-folder-metadata.service';
import { MessageFolderResolver } from 'src/engine/metadata-modules/message-folder/resolvers/message-folder.resolver';
import { PermissionsModule } from 'src/engine/metadata-modules/permissions/permissions.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([MessageFolderEntity]),
    PermissionsModule,
    FeatureFlagModule,
    ConnectedAccountMetadataModule,
    MessageChannelMetadataModule,
  ],
  providers: [
    MessageFolderMetadataService,
    MessageFolderResolver,
    MessageFolderGraphqlApiExceptionInterceptor,
  ],
  exports: [MessageFolderMetadataService],
})
export class MessageFolderMetadataModule {}
