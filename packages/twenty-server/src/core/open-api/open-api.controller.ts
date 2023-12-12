import { Controller, Get, Req, Res } from '@nestjs/common';

import { Request, Response } from 'express';

import { OpenApiService } from 'src/core/open-api/open-api.service';

@Controller('open-api')
export class OpenApiController {
  constructor(private readonly openApiService: OpenApiService) {}

  @Get()
  async generateOpenApiSchema(@Req() request: Request, @Res() res: Response) {
    const data = await this.openApiService.generateSchema(request);

    res.send(data);
  }
}
