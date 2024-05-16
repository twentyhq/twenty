import { Controller, Post, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { RestApiCoreService } from 'src/engine/api/rest/services/rest-api-core.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/utils/clean-graphql-response.utils';

@Controller('rest/batch/*')
export class RestApiCoreBatchController {
  constructor(private readonly restApiCoreService: RestApiCoreService) {}

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.createMany(request);

    res.status(201).send(cleanGraphQLResponse(result.data));
  }
}
