import { Controller, Post, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { CoreService } from 'src/engine/api/rest/services/core.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/utils/clean-graphql-response.utils';

@Controller('rest/batch/*')
export class CoreBatchController {
  constructor(private readonly coreService: CoreService) {}

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.coreService.createMany(request);

    res.status(201).send(cleanGraphQLResponse(result.data));
  }
}
