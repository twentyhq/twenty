import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { RestApiCoreServiceV2 } from 'src/engine/api/rest/core/rest-api-core-v2.service';
import { RestApiCoreService } from 'src/engine/api/rest/core/rest-api-core.service';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { cleanGraphQLResponse } from 'src/engine/api/rest/utils/clean-graphql-response.utils';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/*')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class RestApiCoreController {
  constructor(
    private readonly restApiCoreService: RestApiCoreService,
    private readonly restApiCoreServiceV2: RestApiCoreServiceV2,
  ) {}

  @Post('duplicates')
  @UseFilters(RestApiExceptionFilter)
  async handleApiFindDuplicates(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.findDuplicates(request);

    res.status(200).send(cleanGraphQLResponse(result.data.data));
  }

  @Get()
  async handleApiGet(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.get(request);

    res.status(200).send(cleanGraphQLResponse(result.data.data));
  }

  @Delete()
  // We should move this exception filter to RestApiCoreController class level
  // when all endpoints are migrated to v2
  @UseFilters(RestApiExceptionFilter)
  async handleApiDelete(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.delete(request);

    res.status(200).send(result);
  }

  @Post()
  @UseFilters(RestApiExceptionFilter)
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.createOne(request);

    res.status(201).send(result);
  }

  @Patch()
  @UseFilters(RestApiExceptionFilter)
  async handleApiPatch(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.update(request);

    res.status(200).send(result);
  }

  // This endpoint is not documented in the OpenAPI schema.
  // We keep it to avoid a breaking change since it initially used PUT instead of PATCH,
  // and because the PUT verb is often used as a PATCH.
  @Put()
  @UseFilters(RestApiExceptionFilter)
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.update(request);

    res.status(200).send(result);
  }
}
