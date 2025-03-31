/* eslint-disable no-restricted-imports */
import { Module } from '@nestjs/common';

import { NestjsQueryGraphQLModule } from '@ptc-org/nestjs-query-graphql';
import { NestjsQueryTypeOrmModule } from '@ptc-org/nestjs-query-typeorm';

import { TypeORMModule } from 'src/database/typeorm/typeorm.module';
import { TypeORMService } from 'src/database/typeorm/typeorm.service';
import { ChatbotFlow } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.entity';
import { ChatbotFlowResolver } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.resolver';
import { ChatbotFlowService } from 'src/engine/core-modules/chatbot-flow/chatbot-flow.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { WorkspaceModule } from 'src/engine/core-modules/workspace/workspace.module';

@Module({
  imports: [
    NestjsQueryGraphQLModule.forFeature({
      imports: [
        NestjsQueryTypeOrmModule.forFeature([Workspace, ChatbotFlow], 'core'),
        TypeORMModule,
      ],
    }),
    WorkspaceModule,
  ],
  providers: [ChatbotFlowService, ChatbotFlowResolver, TypeORMService],
})
export class ChatbotFlowModule {}
