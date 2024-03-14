import { Controller, Delete, Get, Post, Put, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { ApiRestService } from 'src/engine/api/rest/api-rest.service';
import { handleResult } from 'src/engine/api/rest/api-rest.controller.utils';

@Controller('rest/*')
export class ApiRestController {
  constructor(private readonly apiRestService: ApiRestService) {}

  @Get()
  async handleApiGet(@Req() request: Request, @Res() res: Response) {
    handleResult(res, await this.apiRestService.get(request));
  }

  @Delete()
  async handleApiDelete(@Req() request: Request, @Res() res: Response) {
    handleResult(res, await this.apiRestService.delete(request));
  }

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    handleResult(res, await this.apiRestService.create(request));
  }

  @Put()
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    handleResult(res, await this.apiRestService.update(request));
  }
}
