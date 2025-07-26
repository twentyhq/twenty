import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { AutocompleteResultDto } from 'src/engine/core-modules/geo-map/dtos/autocomplete-result.dto';
import { PlaceDetailsResultDto } from 'src/engine/core-modules/geo-map/dtos/place-details-result.dto';
import { GeoMapService } from 'src/engine/core-modules/geo-map/services/geo-map.service';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UseGuards(WorkspaceAuthGuard)
export class GeoMapResolver {
  constructor(private readonly geoMapService: GeoMapService) {}

  @Query(() => [AutocompleteResultDto])
  async getAutoCompleteAddress(
    @Args('address') address: string,
    @Args('token') token: string,
    @Args('country', { nullable: true }) country?: string,
    @Args('isFieldCity', { nullable: true }) isFieldCity?: boolean,
  ) {
    return this.geoMapService.getAutoCompleteAddress(
      address,
      token,
      country,
      isFieldCity,
    );
  }

  @Query(() => PlaceDetailsResultDto)
  async getAddressDetails(
    @Args('placeId') placeId: string,
    @Args('token') token: string,
  ) {
    return this.geoMapService.getAddressDetails(placeId, token);
  }
}
