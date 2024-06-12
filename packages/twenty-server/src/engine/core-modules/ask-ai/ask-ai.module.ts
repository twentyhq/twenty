import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { WorkspaceDataSourceModule } from 'src/engine/workspace-datasource/workspace-datasource.module';
import { UserModule } from 'src/engine/core-modules/user/user.module';
import { AskAIResolver } from 'src/engine/core-modules/ask-ai/ask-ai.resolver';
import { AskAIService } from 'src/engine/core-modules/ask-ai/ask-ai.service';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
@Module({
  imports: [
    WorkspaceDataSourceModule,
    UserModule,
    TypeOrmModule.forFeature([FeatureFlagEntity], 'core'),
  ],
  exports: [],
  providers: [AskAIResolver, AskAIService],
})
export class AskAIModule {}
