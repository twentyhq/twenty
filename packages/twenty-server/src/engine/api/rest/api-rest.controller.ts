import { Controller, Delete, Get, Post, Put, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { ApiRestService } from 'src/engine/api/rest/api-rest.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/api-rest.controller.utils';

@Controller('rest/*')
export class ApiRestController {
  constructor(private readonly apiRestService: ApiRestService) {}

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
    const result = await this.apiRestService.create(request);

    res.send(cleanGraphQLResponse(result.data));
  }

  @Put()
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    const result = await this.apiRestService.update(request);

    res.send(cleanGraphQLResponse(result.data));
  }
}
