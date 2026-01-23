import { Controller, Get, Res, UseGuards } from '@nestjs/common';

import { Response } from 'express';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

import { PrometheusService } from './prometheus.service';

@Controller('metrics')
@UseGuards(PublicEndpointGuard, NoPermissionGuard)
export class PrometheusController {
  constructor(private readonly prometheusService: PrometheusService) {}

  @Get()
  async getMetrics(@Res() res: Response): Promise<void> {
    res.set('Content-Type', this.prometheusService.getContentType());
    res.send(await this.prometheusService.getMetrics());
  }
}
