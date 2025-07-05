import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import { CoreMessage } from 'ai';
import { Response } from 'express';

import { AiService } from 'src/engine/core-modules/ai/services/ai.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

export interface ChatRequest {
  messages: CoreMessage[];
  temperature?: number;
  maxTokens?: number;
}

@Controller('chat')
@UseGuards(WorkspaceAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Post()
  async chat(
    @Body() request: ChatRequest,
    @AuthWorkspace() workspace: Workspace,
    @Res() res: Response,
  ) {
    const isAiEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_AI_ENABLED,
      workspace.id,
    );

    if (!isAiEnabled) {
      throw new HttpException(
        'AI feature is not enabled for this workspace',
        HttpStatus.FORBIDDEN,
      );
    }

    const { messages, temperature, maxTokens } = request;

    if (!messages || messages.length === 0) {
      throw new HttpException(
        'Messages array is required and cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const result = this.aiService.streamText(messages, {
        temperature,
        maxTokens,
      });

      result.pipeDataStreamToResponse(res);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';

      throw new HttpException(
        `An error occurred while processing your request: ${errorMessage}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
