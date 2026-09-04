import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Request } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { RunAsWorkspaceMemberTokenDto } from 'src/engine/core-modules/auth/dto/run-as-workspace-member-token.dto';
import { RunAsWorkspaceMemberTokenService } from 'src/engine/core-modules/auth/services/run-as-workspace-member-token.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller(`${ApiPath.App}/tokens`)
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class AppTokensController {
  constructor(
    private readonly runAsWorkspaceMemberTokenService: RunAsWorkspaceMemberTokenService,
  ) {}

  // A webhook gives a logic function no user context, so a function that acts
  // on behalf of somebody (rendering a record preview for the person who asked
  // for it) otherwise reads with the app's own role and shows them records
  // their role hides. The token returned here carries both the application and
  // the member, and permissions for that pair are the intersection of the two
  // roles: it can only ever narrow what the calling token already reaches.
  @Post('run-as-workspace-member')
  @HttpCode(HttpStatus.OK)
  async runAsWorkspaceMember(
    @Req() request: Request,
    @Body() body: RunAsWorkspaceMemberTokenDto,
  ): Promise<AuthToken> {
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new ForbiddenException(
        'This endpoint requires an APPLICATION_ACCESS token.',
      );
    }

    return this.runAsWorkspaceMemberTokenService.generateAccessToken({
      applicationId: request.application.id,
      workspaceId: request.workspace.id,
      workspaceMemberId: body.workspaceMemberId,
      requestWorkspaceMemberId: request.workspaceMemberId ?? null,
    });
  }
}
