import { Controller, Get, Post, Body, Param, Logger, HttpCode, NotFoundException } from '@nestjs/common';

import { EventManagementService } from './event-management.service';

@Controller('rest/events')
export class EventManagementController {
  private readonly logger = new Logger(EventManagementController.name);

  constructor(private readonly service: EventManagementService) {}

  @Get(':eventId/check-in/:qrCode')
  async checkInByQR(
    @Param('eventId') eventId: string,
    @Param('qrCode') qrCode: string,
  ) {
    this.logger.log(`QR check-in: event ${eventId}, code ${qrCode}`);
    const registration = await this.service.checkInByQR(qrCode);

    return { success: true, registrationId: registration.id, status: registration.status };
  }

  @Post(':eventId/register')
  @HttpCode(200)
  async publicRegister(
    @Param('eventId') eventId: string,
    @Body() payload: { contactId: string },
  ) {
    this.logger.log(`Public registration: event ${eventId}, contact ${payload.contactId}`);
    const registration = await this.service.registerAttendee(eventId, payload.contactId);

    return {
      success: true,
      registrationId: registration.id,
      status: registration.status,
      qrCode: registration.qrCode ?? null,
    };
  }
}
