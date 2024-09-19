import { Controller, Post, Req, Res, UseGuards } from '@nestjs/common';

import { Request, Response } from 'express';

import { RestApiCoreService } from 'src/engine/api/rest/core/rest-api-core.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/utils/clean-graphql-response.utils';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/batch/*')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
export class RestApiCoreBatchController {
  constructor(private readonly restApiCoreService: RestApiCoreService) {}

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.createMany(request);

    res.status(201).send(cleanGraphQLResponse(result.data));
  }
}
