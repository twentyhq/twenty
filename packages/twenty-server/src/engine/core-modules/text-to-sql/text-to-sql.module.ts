import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { TextToSQLResolver } from 'src/engine/core-modules/text-to-sql/text-to-sql.resolver';
import { TextToSQLService } from 'src/engine/core-modules/text-to-sql/text-to-sql.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
@Module({
  imports: [
    WorkspaceDataSourceModule,
    UserModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
  ],
  exports: [],
  providers: [TextToSQLResolver, TextToSQLService],
})
export class TextToSQLModule {}
