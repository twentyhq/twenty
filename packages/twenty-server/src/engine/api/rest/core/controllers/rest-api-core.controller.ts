import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { RestApiCoreService } from 'src/engine/api/rest/core/rest-api-core.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/utils/clean-graphql-response.utils';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/*')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class RestApiCoreController {
  constructor(private readonly restApiCoreService: RestApiCoreService) {}

  @Post('/duplicates')
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
  async handleApiDelete(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.delete(request);

    res.status(200).send(cleanGraphQLResponse(result.data.data));
  }

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.createOne(request);

    res.status(201).send(cleanGraphQLResponse(result.data.data));
  }

  @Patch()
  async handleApiPatch(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.update(request);

    res.status(200).send(cleanGraphQLResponse(result.data.data));
  }

  // This endpoint is not documented in the OpenAPI schema.
  // We keep it to avoid a breaking change since it initially used PUT instead of PATCH,
  // and because the PUT verb is often used as a PATCH.
  @Put()
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.update(request);

    res.status(200).send(cleanGraphQLResponse(result.data.data));
  }
}
