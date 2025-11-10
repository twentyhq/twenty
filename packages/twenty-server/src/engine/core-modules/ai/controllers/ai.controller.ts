import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';

import { type ModelMessage } from 'ai';
import { Response } from 'express';

import { AIBillingService } from 'src/engine/core-modules/ai/services/ai-billing.service';
import { AiModelRegistryService } from 'src/engine/core-modules/ai/services/ai-model-registry.service';
import { AiService } from 'src/engine/core-modules/ai/services/ai.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

interface ChatRequest {
  messages: ModelMessage[];
  temperature?: number;
  maxOutputTokens?: number;
}

@Controller('chat')
@UseGuards(WorkspaceAuthGuard, CustomPermissionGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly aiBillingService: AIBillingService,
    private readonly aiModelRegistryService: AiModelRegistryService,
  ) {}

  @Post()
  async chat(
    @Body() request: ChatRequest,
    @AuthWorkspace() workspace: WorkspaceEntity,
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

    const { messages, temperature, maxOutputTokens } = request;

    if (!messages || messages.length === 0) {
      throw new HttpException(
        'Messages array is required and cannot be empty',
        HttpStatus.BAD_REQUEST,
      );
    }

    try {
      const registeredModel =
        this.aiModelRegistryService.getDefaultPerformanceModel();

      const result = this.aiService.streamText({
        messages,
        options: {
          temperature,
          maxOutputTokens,
          model: registeredModel.model,
        },
      });

      result.usage.then((usage) => {
        this.aiBillingService.calculateAndBillUsage(
          registeredModel.modelId,
          usage,
          workspace.id,
        );
      });

      result.pipeUIMessageStreamToResponse(res);
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
