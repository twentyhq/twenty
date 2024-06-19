import {
  Controller,
  Get,
  Delete,
  Post,
  Req,
  Res,
  Patch,
  Put,
} from '@nestjs/common';

import { Request, Response } from 'express';

import { RestApiMetadataService } from 'src/engine/api/rest/metadata/rest-api-metadata.service';
import { cleanGraphQLResponse } from 'src/engine/api/rest/utils/clean-graphql-response.utils';

@Controller('rest/metadata/*')
export class RestApiMetadataController {
  constructor(
    private readonly restApiMetadataService: RestApiMetadataService,
  ) {}

  @Get()
  async handleApiGet(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiMetadataService.get(request);

    res.status(200).send(cleanGraphQLResponse(result.data.data));
  }

  @Delete()
  async handleApiDelete(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiMetadataService.delete(request);

    res.status(200).send(cleanGraphQLResponse(result.data.data));
  }

  @Post()
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiMetadataService.create(request);

    res.status(201).send(cleanGraphQLResponse(result.data.data));
  }

  @Patch()
  async handleApiPatch(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiMetadataService.update(request);

    res.status(200).send(cleanGraphQLResponse(result.data.data));
  }

  // This endpoint is not documented in the OpenAPI schema.
  // We keep it to avoid a breaking change since it initially used PUT instead of PATCH,
  // and because the PUT verb is often used as a PATCH.
  @Put()
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiMetadataService.update(request);

    res.status(200).send(cleanGraphQLResponse(result.data.data));
  }
}
