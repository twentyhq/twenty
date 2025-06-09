import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';

import {
  AiService,
  ChatCompletionRequest,
} from 'src/engine/core-modules/ai/ai.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Post('chat/completions')
  async chat(
    @Body() request: ChatCompletionRequest,
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

    const { messages, temperature, max_tokens, tools, tool_choice } = request;

    if (!messages || messages.length === 0) {
      throw new HttpException(
        'Messages array is required and cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const convertedTools =
        this.aiService.convertOpenAICompatibleToolsToAISDK(tools);
      const convertedToolChoice =
        this.aiService.convertOpenAICompatibleToolChoiceToAISDK(tool_choice);

      const result = this.aiService.streamText(messages, {
        temperature,
        maxTokens: max_tokens,
        tools: convertedTools,
        toolChoice: convertedToolChoice,
      });

      if (!result || typeof result.pipeDataStreamToResponse !== 'function') {
        throw new Error('Invalid stream result');
      }

      result.pipeDataStreamToResponse(res, {
        getErrorMessage: (error: unknown) => {
          if (error instanceof Error) {
            return error.message;
          }

          return 'Unknown error occurred';
        },
      });
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
