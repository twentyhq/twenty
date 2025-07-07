import {
  Controller,
  Delete,
  Get,
  Patch,
  Post,
  Put,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';

import { Request, Response } from 'express';
import { z } from 'zod';

import { Tool } from 'src/engine/api/mcp/decorators/tool.decorator';
import { RestApiCoreService } from 'src/engine/api/rest/core/services/rest-api-core.service';
import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class RestApiCoreController {
  constructor(private readonly restApiCoreService: RestApiCoreService) {}

  @Post('batch/*')
  async handleApiPostBatch(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.createMany(request);

    res.status(201).send(result);
  }

  @Post('*/duplicates')
  async handleApiFindDuplicates(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.findDuplicates(request);

    res.status(200).send(result);
  }

  @Post('*')
  @Tool({
    name: 'create-record',
    description: 'Creates a new record in the specified object',
    parameters: z.object({
      objectName: z
        .string()
        .describe('Name of the object to create a record for'),
      data: z.record(z.any()).describe('Data for the new record'),
    }),
  })
  async handleApiPost(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.createOne(request);

    res.status(201).send(result);
  }

  @Get('*')
  @Tool({
    name: 'get-records',
    description:
      'Retrieves records from the specified object with optional filtering',
    parameters: z.object({
      objectName: z
        .string()
        .describe('Name of the object to retrieve records from'),
      filters: z
        .record(z.any())
        .optional()
        .describe('Optional filters to apply'),
      sort: z
        .array(z.string())
        .optional()
        .describe('Optional sorting parameters'),
      pagination: z
        .object({
          page: z.number().optional().default(1),
          limit: z.number().optional().default(10),
        })
        .optional()
        .describe('Optional pagination parameters'),
    }),
  })
  async handleApiGet(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.get(request);

    res.status(200).send(result);
  }

  @Delete('*')
  async handleApiDelete(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.delete(request);

    res.status(200).send(result);
  }

  @Patch('*')
  @Tool({
    name: 'update-records',
    description: 'Updates records in the specified object',
    parameters: z.object({
      objectName: z
        .string()
        .describe('Name of the object to update records in'),
      id: z.string().describe('ID of the record to update'),
      data: z.record(z.any()).describe('Data to update the record with'),
    }),
  })
  async handleApiPatch(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.update(request);

    res.status(200).send(result);
  }

  // This endpoint is not documented in the OpenAPI schema.
  // We keep it to avoid a breaking change since it initially used PUT instead
  // of PATCH, and because the PUT verb is often used as a PATCH.
  @Put('*')
  async handleApiPut(@Req() request: Request, @Res() res: Response) {
    const result = await this.restApiCoreService.update(request);

    res.status(200).send(result);
  }
}
