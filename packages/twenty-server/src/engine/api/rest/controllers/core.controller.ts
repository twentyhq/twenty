import { Controller, Delete, Get, Post, Put, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { CoreService } from 'src/engine/api/rest/core.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/controllers/utils/api-rest.controller.utils';

@Controller('rest/*')
export class CoreController {
  constructor(private readonly apiRestService: CoreService) {}

  @Get()
  async handleApiGet(@Req() request: Request, @Res() res: Response) {
    const result = await this.apiRestService.get(request);

    res.send(cleanGraphQLResponse(result.data));
  }

  @Delete()
  async handleApiDelete(@Req() request: Request, @Res() res: Response) {
    const result = await this.apiRestService.delete(request);

    res.send(cleanGraphQLResponse(result.data));
  }

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.apiRestService.createOne(request);

    res.send(cleanGraphQLResponse(result.data));
  }

  @Put()
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    const result = await this.apiRestService.update(request);

    res.send(cleanGraphQLResponse(result.data));
  }
}
