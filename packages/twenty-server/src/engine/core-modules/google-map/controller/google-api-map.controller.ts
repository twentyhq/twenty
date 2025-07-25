import { Controller, Get, Query, UseFilters, UseGuards } from '@nestjs/common';

import { RestApiExceptionFilter } from 'src/engine/api/rest/rest-api-exception.filter';
import { GoogleApiMapService } from 'src/engine/core-modules/google-map/services/google-api-map.service';
import { JwtAuthGuard } from 'src/engine/guards/jwt-auth.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Controller('rest/place-api')
@UseGuards(JwtAuthGuard, WorkspaceAuthGuard)
@UseFilters(RestApiExceptionFilter)
export class GoogleApiMapController {
  constructor(private readonly googleApiMapService: GoogleApiMapService) {}

  @Get('autocomplete')
  async getAutoCompleteAddress(
    @Query('address') address: string,
    @Query('token') token: string,
    @Query('country') country?: string,
  ) {
    const results = await this.googleApiMapService.getAutoCompleteAddress(
      address,
      token,
      country,
    );

    return results;
  }

  @Get('details')
  async getAddressDetails(
    @Query('placeId') placeId: string,
    @Query('token') token: string,
  ) {
    return this.googleApiMapService.getAddressDetails(placeId, token);
  }
}
