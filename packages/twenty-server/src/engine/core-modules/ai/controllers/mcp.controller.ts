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

import { AiService } from 'src/engine/core-modules/ai/ai.service';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';

@Controller('mcp/tools/manifest')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class McpController {
  constructor(
    private readonly featureFlagService: FeatureFlagService,
  ) {}

  @Post()
  async listTools(
    @Body() request: any,
    @AuthWorkspace() workspace: Workspace,
    @Res() res: Response,
  ) {
    return []
  }
}
