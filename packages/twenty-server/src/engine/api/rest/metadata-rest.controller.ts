import { Controller, Get, Delete, Post, Put, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { handleResult } from 'src/engine/api/rest/api-rest.controller.utils';
import { ApiRestMetadataService } from 'src/engine/api/rest/metadata-rest.service';

@Controller('rest/metadata/*')
export class ApiRestMetadataController {
  constructor(private readonly apiRestService: ApiRestMetadataService) {}

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
