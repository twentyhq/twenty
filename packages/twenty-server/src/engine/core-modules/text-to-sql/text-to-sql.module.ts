import { Module } from '@nestjs/common';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { TextToSQLResolver } from 'src/engine/core-modules/text-to-sql/text-to-sql.resolver';
import { TextToSQLService } from 'src/engine/core-modules/text-to-sql/text-to-sql.service';
import { DataSourceModule } from 'src/engine/metadata-modules/data-source/data-source.module';
import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
@Module({
  imports: [
    WorkspaceDataSourceModule,
    UserModule,
    DataSourceModule,
    TypeORMModule,
  ],
  exports: [],
  providers: [TextToSQLResolver, TextToSQLService],
})
export class TextToSQLModule {}
