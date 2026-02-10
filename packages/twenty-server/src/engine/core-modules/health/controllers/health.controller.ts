import { Controller, Get, UseGuards } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';

import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { PublicEndpointGuard } from 'src/engine/guards/public-endpoint.guard';

@Controller('healthz')
export class HealthController {
  constructor(private readonly health: HealthCheckService) {}

  @Get()
  @UseGuards(PublicEndpointGuard, NoPermissionGuard)
  @HealthCheck()
  check() {
    return this.health.check([]);
  }
}
