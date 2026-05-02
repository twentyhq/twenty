import {
  Body,
  Controller,
  ForbiddenException,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { type AppConnectionDto } from 'src/engine/core-modules/application/application-oauth-provider/connections/dtos/app-connection.dto';
import { GetAppConnectionDto } from 'src/engine/core-modules/application/application-oauth-provider/connections/dtos/get-app-connection.dto';
import { ListAppConnectionsDto } from 'src/engine/core-modules/application/application-oauth-provider/connections/dtos/list-app-connections.dto';
import { ApplicationConnectionsListService } from 'src/engine/core-modules/application/application-oauth-provider/connections/services/application-connections-list.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

// On-demand connection lookup for app logic functions. Authenticated via the
// application access token (already injected into the function runtime as
// TWENTY_APP_ACCESS_TOKEN). Apps can only list/get their own connections.
@Controller('apps/connections')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard, NoPermissionGuard)
export class ApplicationConnectionsController {
  constructor(
    private readonly listService: ApplicationConnectionsListService,
  ) {}

  @Post('list')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async list(
    @Req() request: Request,
    @Body() filter: ListAppConnectionsDto,
  ): Promise<AppConnectionDto[]> {
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new ForbiddenException(
        'This endpoint requires an APPLICATION_ACCESS token.',
      );
    }

    return this.listService.list({
      applicationId: request.application.id,
      workspaceId: request.workspace.id,
      requestUserWorkspaceId: request.userWorkspaceId ?? null,
      filter,
    });
  }

  @Post('get')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  async get(
    @Req() request: Request,
    @Body() body: GetAppConnectionDto,
  ): Promise<AppConnectionDto> {
    if (!isDefined(request.application) || !isDefined(request.workspace)) {
      throw new ForbiddenException(
        'This endpoint requires an APPLICATION_ACCESS token.',
      );
    }

    const connection = await this.listService.get({
      id: body.id,
      applicationId: request.application.id,
      workspaceId: request.workspace.id,
      requestUserWorkspaceId: request.userWorkspaceId ?? null,
    });

    if (!connection) {
      throw new NotFoundException(`Connection ${body.id} not found`);
    }

    return connection;
  }
}
