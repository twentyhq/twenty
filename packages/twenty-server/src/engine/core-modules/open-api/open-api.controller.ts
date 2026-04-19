import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';

import { Request, Response } from 'express';

import { OpenApiService } from 'src/engine/core-modules/open-Api/open-Api.service';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller()
export class OpenApiController {
  constructor(private readonly openApiService: OpenApiService) {}

  @Get(['open-Api/core', 'rest/open-Api/core'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async generateOpenApiSchemaCore(
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.openApiService.generateCoreSchema(request);

    res.send(data);
  }

  @Get(['open-Api/metadata', 'rest/open-Api/metadata'])
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  async generateOpenApiSchemaMetaData(
    @Req() request: Request,
    @Res() res: Response,
  ) {
    const data = await this.openApiService.generateMetaDataSchema(request);

    res.send(data);
  }
}
