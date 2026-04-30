import { Controller, Post, Get, Body, Param, Headers, Logger, HttpCode } from '@nestjs/common';

import { FleetService } from './fleet.service';

@Controller('rest/fleet')
export class FleetController {
  private readonly logger = new Logger(FleetController.name);

  constructor(private readonly service: FleetService) {}

  @Post('tracking/location')
  @HttpCode(200)
  async updateDriverLocation(
    @Body() payload: {
      driverId: string;
      lat: number;
      lng: number;
      speed?: number;
    },
  ) {
    await this.service.updateDriverLocation(
      payload.driverId,
      payload.lat,
      payload.lng,
      payload.speed,
    );

    return { success: true };
  }

  @Get('tracking/:deliveryId')
  async getDeliveryTracking(@Param('deliveryId') deliveryId: string) {
    this.logger.log(`Tracking request: delivery ${deliveryId}`);
    const tracking = await this.service.getDeliveryTracking(deliveryId);

    if (!tracking) {
      return { success: false, message: 'Delivery not found or not assigned' };
    }

    return { success: true, ...tracking };
  }
}
