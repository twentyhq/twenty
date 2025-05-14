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
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class RestApiCoreController {
  constructor(
    private readonly restApiCoreService: RestApiCoreService,
    private readonly restApiCoreServiceV2: RestApiCoreServiceV2,
  ) {}

  @Post('batch/*')
  async handleApiPostBatch(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.createMany(request);

    res.status(201).send(result);
  }

  @Post('*/duplicates')
  async handleApiFindDuplicates(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.findDuplicates(request);

    res.status(200).send(result);
  }

  @Post('*')
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.createOne(request);

    res.status(201).send(result);
  }

  @Get('*')
  async handleApiGet(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.get(request);

    res.status(200).send(result);
  }

  @Delete('*')
  async handleApiDelete(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.delete(request);

    res.status(200).send(result);
  }

  @Patch('*')
  async handleApiPatch(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.update(request);

    res.status(200).send(result);
  }

  // This endpoint is not documented in the OpenAPI schema.
  // We keep it to avoid a breaking change since it initially used PUT instead
  // of PATCH, and because the PUT verb is often used as a PATCH.
  @Put('*')
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreServiceV2.update(request);

    res.status(200).send(result);
  }
}
