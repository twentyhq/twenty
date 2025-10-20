import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FillNullServerlessFunctionLayerIdCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-fill-null-serverless-function-layer-id.command';
import { MigrateAttachmentAuthorToCreatedByCommand } from 'src/database/commands/upgrade-version-command/1-8/1-8-migrate-attachment-author-to-created-by.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ServerlessFunctionEntity } from 'src/engine/metadata-modules/serverless-function/serverless-function.entity';
import { ServerlessFunctionLayerEntity } from 'src/engine/metadata-modules/serverless-function-layer/serverless-function-layer.entity';
import { TwentyORMModule } from 'src/engine/twenty-orm/twenty-orm.module';

@Module({
  imports: [
    TwentyORMModule,
    TypeOrmModule.forFeature([
      Workspace,
      ServerlessFunctionEntity,
      ServerlessFunctionLayerEntity,
    ]),
  ],
  providers: [
    MigrateAttachmentAuthorToCreatedByCommand,
    FillNullServerlessFunctionLayerIdCommand,
  ],
  exports: [
    MigrateAttachmentAuthorToCreatedByCommand,
    FillNullServerlessFunctionLayerIdCommand,
  ],
})
export class V1_8_UpgradeVersionCommandModule {}
