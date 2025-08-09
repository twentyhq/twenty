import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { AiAgentConfig } from 'src/engine/core-modules/ai-agent-config/ai-agent-config.entity';
import { AiAgentConfigResolver } from 'src/engine/core-modules/ai-agent-config/ai-agent-config.resolver';
import { AiAgentConfigService } from 'src/engine/core-modules/ai-agent-config/ai-agent-config.service';
import { NestboxAiResolver } from 'src/engine/core-modules/ai-agent-config/nestbox-ai.resolver';
import { NestboxAiService } from 'src/engine/core-modules/ai-agent-config/nestbox-ai.service';
import { TwentyConfigModule } from 'src/engine/core-modules/twenty-config/twenty-config.module';

import { aiAgentConfigAutoResolverOpts } from './ai-agent-config.auto-resolver-opts';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([AiAgentConfig], 'core'),
        TypeORMModule,
      ],
      resolvers: aiAgentConfigAutoResolverOpts,
    }),
    TypeOrmModule.forFeature([AiAgentConfig], 'core'),
    TwentyConfigModule,
  ],
  providers: [
    AiAgentConfigResolver, 
    AiAgentConfigService, 
    NestboxAiResolver,
    NestboxAiService,
    TypeORMService
  ],
  exports: [
    AiAgentConfigResolver, 
    AiAgentConfigService,
    NestboxAiService
  ],
})
export class AiAgentConfigModule {} 