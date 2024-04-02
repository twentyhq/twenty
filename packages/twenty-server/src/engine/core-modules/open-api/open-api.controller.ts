import { Controller, Get, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { OpenApiService } from 'src/engine/core-modules/open-api/open-api.service';

@Controller('open-api')
export class OpenApiController {
  constructor(private readonly openApiService: OpenApiService) {}

  @Get('core')
  async generateOpenApiSchemaCore(
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.openApiService.generateCoreSchema(request);

    res.send(data);
  }

  @Get('metadata')
  async generateOpenApiSchemaMetaData(
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.openApiService.generateMetaDataSchema(request);

    res.send(data);
  }
}
