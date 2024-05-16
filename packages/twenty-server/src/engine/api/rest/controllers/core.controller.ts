import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  Res,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { CoreService } from 'src/engine/api/rest/services/core.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/utils/clean-graphql-response.utils';

@Controller('rest/*')
export class CoreController {
  constructor(private readonly coreService: CoreService) {}

  @Get()
  async handleApiGet(@Req() request: Request, @Res() res: Response) {
    const result = await this.coreService.get(request);

    res.status(200).send(cleanGraphQLResponse(result.data));
  }

  @Delete()
  async handleApiDelete(@Req() request: Request, @Res() res: Response) {
    const result = await this.coreService.delete(request);

    res.status(200).send(cleanGraphQLResponse(result.data));
  }

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.coreService.createOne(request);

    res.status(201).send(cleanGraphQLResponse(result.data));
  }

  @Patch()
  async handleApiPatch(@Req() request: Request, @Res() res: Response) {
    const result = await this.coreService.update(request);

    res.status(200).send(cleanGraphQLResponse(result.data));
  }

  // This endpoint is not documented in the OpenAPI schema.
  // We keep it to avoid a breaking change since it initially used PUT instead of PATCH,
  // and because the PUT verb is often used as a PATCH.
  @Put()
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    const result = await this.coreService.update(request);

    res.status(200).send(cleanGraphQLResponse(result.data));
  }
}
