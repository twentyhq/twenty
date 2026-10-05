import {
  Controller,
  Delete,
  Get,
  Logger,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Response } from 'express';
import { ApiPath } from 'twenty-shared/types';

import { RestApiCoreService } from 'src/engine/api/rest/core/services/rest-api-core.service';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { AuthenticatedRequest } from 'src/engine/api/rest/types/authenticated-request.type';
import { CustomPermissionGuard } from 'src/engine/guards/custom-permission.guard';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { AuthPrincipalGuard } from 'src/engine/guards/auth-principal.guard';
import { AuthRestApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-rest-api-exception.filter';

@Controller(ApiPath.Rest)
@UseGuards(
  JwtAuthGuard,
  AuthPrincipalGuard({
    userSession: {
      standard: true,
      impersonated: true,
      playground: true,
      workspaceAgnostic: false,
    },
    apiKey: true,
    oauthClient: true,
    application: true,
  }),
  CustomPermissionGuard,
)
@UseFilters(RestApiExceptionFilter, AuthRestApiExceptionFilter)
export class RestApiCoreController {
  private readonly logger = new Logger(RestApiCoreController.name);
  constructor(private readonly restApiCoreService: RestApiCoreService) {}

  @Post('batch/*path')
  async handleApiPostBatch(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing BATCH request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.createMany(request);

    res.status(201).send(result);
  }

  @Post('*path/duplicates')
  async handleApiFindDuplicates(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing DUPLICATES request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.findDuplicates(request);

    res.status(200).send(result);
  }

  @Post('*path')
  async handleApiPost(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing POST request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.createOne(request);

    res.status(201).send(result);
  }

  @Get('*path/groupBy')
  async handleApiGroupBy(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing GROUP BY request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.groupBy(request);

    res.status(200).send(result);
  }

  @Get('*path')
  async handleApiGet(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing GET request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.get(request);

    res.status(200).send(result);
  }

  @Delete('*path')
  async handleApiDelete(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing DELETE request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.delete(request);

    res.status(200).send(result);
  }

  @Patch('*path/restore')
  async handleApiRestore(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing RESTORE request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.restore(request);

    res.status(200).send(result);
  }

  @Patch('*path/merge')
  async handleApiMerge(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing MERGE request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.mergeMany(request);

    res.status(200).send(result);
  }

  @Patch('*path')
  async handleApiPatch(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing PATCH request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.update(request);

    res.status(200).send(result);
  }

  // Undocumented legacy alias of PATCH, kept to avoid a breaking change
  @Put('*path')
  async handleApiPut(
    @Req() request: AuthenticatedRequest,
    @Res() res: Response,
  ) {
    this.logger.log(
      `[REST API] Processing PUT request to ${request.path} on workspace ${request.workspaceId}`,
    );
    const result = await this.restApiCoreService.update(request);

    res.status(200).send(result);
  }
}
