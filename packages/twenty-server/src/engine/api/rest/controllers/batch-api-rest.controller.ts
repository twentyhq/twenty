import { Controller, Post, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { ApiRestService } from 'src/engine/api/rest/api-rest.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/controllers/utils/api-rest.controller.utils';

@Controller('rest/batch/*')
export class BatchApiRestController {
  constructor(private readonly apiRestService: ApiRestService) {}

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.apiRestService.createMany(request);

    res.send(cleanGraphQLResponse(result.data));
  }
}
