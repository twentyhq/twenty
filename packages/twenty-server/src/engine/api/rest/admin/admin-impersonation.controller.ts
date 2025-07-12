import {
  Controller,
  Post,
  Param,
  UseGuards,
  UseFilters,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';

import { AuthToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { AdminImpersonationService } from 'src/engine/core-modules/auth/services/admin-impersonation.service';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { User } from 'src/engine/core-modules/user/user.entity';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { AdminPanelGuard } from 'src/engine/guards/admin-panel-guard';

@Controller('rest/admin')
@UseGuards(JwtAuthGuard, AdminPanelGuard)
@UseFilters(RestApiExceptionFilter)
export class AdminImpersonationController {
  constructor(
    private readonly adminImpersonationService: AdminImpersonationService,
  ) {}

  @Post('workspaces/:workspaceId/impersonate')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard, AdminPanelGuard)
  async impersonateWorkspace(
    @Param('workspaceId') workspaceId: string,
    @AuthUser() currentUser: User,
  ): Promise<AuthToken> {
    return this.adminImpersonationService.generateImpersonationToken(
      currentUser.id,
      workspaceId,
    );
  }
}
