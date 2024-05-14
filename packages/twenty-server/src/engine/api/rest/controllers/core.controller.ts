import { Controller, Delete, Get, Patch, Post, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { CoreService } from 'src/engine/api/rest/services/core.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/utils/clean-graphql-response.utils';

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

  @Patch()
  async handleApiPatch(@Req() request: Request, @Res() res: Response) {
    const result = await this.apiRestService.update(request);

    res.send(cleanGraphQLResponse(result.data));
  }
}
