import { Controller, Post, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { CoreService } from 'src/engine/api/rest/core.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/controllers/utils/api-rest.controller.utils';

@Controller('rest/batch/*')
export class CoreBatchController {
  constructor(private readonly apiRestService: CoreService) {}

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.apiRestService.createMany(request);

    res.send(cleanGraphQLResponse(result.data));
  }
}
