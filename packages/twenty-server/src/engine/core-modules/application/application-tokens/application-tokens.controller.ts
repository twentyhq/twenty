import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseFilters,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { Request } from 'express';
import { ApiPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { RunAsWorkspaceMemberTokenDto } from 'src/engine/core-modules/application/application-tokens/dtos/run-as-workspace-member-token.dto';
import { RunAsWorkspaceMemberTokenService } from 'src/engine/core-modules/application/application-tokens/services/run-as-workspace-member-token.service';
import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type AuthToken } from 'src/engine/core-modules/auth/dto/auth-token.dto';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';
import { ThrottlerService } from 'src/engine/core-modules/throttler/throttler.service';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

// Application access tokens are JWTs usable outside the runtime, so a credential-minting route gets its own throttle.
const RUN_AS_WORKSPACE_MEMBER_THROTTLE_LIMIT = 1000;
const RUN_AS_WORKSPACE_MEMBER_THROTTLE_TTL_MS = 60_000;

@Controller(`${ApiPath.App}/tokens`)
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, CustomPermissionGuard)
@UseFilters(AuthRestApiExceptionFilter)
@UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
export class ApplicationTokensController {
  constructor(
    private readonly runAsWorkspaceMemberTokenService: RunAsWorkspaceMemberTokenService,
    private readonly throttlerService: ThrottlerService,
  ) {}

  @Post('run-as-workspace-member')
  @HttpCode(HttpStatus.OK)
  async runAsWorkspaceMember(
    @Req() request: Request,
    @Body() body: RunAsWorkspaceMemberTokenDto,
  ): Promise<AuthToken> {
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new AuthException(
        'This endpoint requires an APPLICATION_ACCESS token.',
        AuthExceptionCode.FORBIDDEN_EXCEPTION,
        {
          userFriendlyMessage: msg`This endpoint is only available to applications.`,
        },
      );
    }

    await this.throttlerService.tokenBucketThrottleOrThrow(
      `${request.workspace.id}-${request.application.id}-run-as-workspace-member`,
      1,
      RUN_AS_WORKSPACE_MEMBER_THROTTLE_LIMIT,
      RUN_AS_WORKSPACE_MEMBER_THROTTLE_TTL_MS,
    );

    return this.runAsWorkspaceMemberTokenService.generateAccessToken({
      application: request.application,
      workspaceId: request.workspace.id,
      workspaceMemberId: body.workspaceMemberId,
      isDelegatedToUser: isDefined(request.userWorkspaceId),
    });
  }
}
