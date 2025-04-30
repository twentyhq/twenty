import { Controller, Get, Param, Req, Res, UseFilters } from '@nestjs/common';

import { Request, Response } from 'express';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { TraceableService } from 'src/engine/core-modules/dadshboard-linklogs/services/traceable.service';

@Controller('traceable')
@UseFilters(RestApiExceptionFilter)
export class TraceableController {
  constructor(private readonly traceableService: TraceableService) {}

  @Get('/r/:workspaceId/:traceableId')
  async handleLinkAccess(
    @Req() req: Request,
    @Res() res: Response,
    @Param('workspaceId') workspaceId: string,
    @Param('traceableId') traceableId: string,
  ) {
    const { traceable, notFoundUrl } =
      await this.traceableService.handleLinkAccess({
        workspaceId,
        traceableId,
        userAgent: req.headers['user-agent'] || '',
        userIp: req.ip || '',
      });

    const finalUrl = traceable?.url?.primaryLinkUrl;

    return res.redirect(302, finalUrl ?? (notFoundUrl as string));
  }
}
