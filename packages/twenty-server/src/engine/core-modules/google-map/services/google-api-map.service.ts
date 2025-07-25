import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import {
  AutocompleteSanitizedResult,
  sanitizeAutocompleteResults,
} from 'src/engine/core-modules/google-map/utils/sanitize-autocomplete-results.util';
import {
  AddressFields,
  sanitizePlaceDetailsResults,
} from 'src/engine/core-modules/google-map/utils/sanitize-place-details-results.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class GoogleApiMapService {
  private apiMapKey: string | undefined;
  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly httpService: HttpService,
  ) {
    if (
      !this.twentyConfigService.get('GOOGLE_MAP_API_ENABLED') ||
      !this.twentyConfigService.get('GOOGLE_MAP_API_KEY')
    ) {
      return;
    }
    this.apiMapKey = this.twentyConfigService.get('GOOGLE_MAP_API_KEY');
  }

  public async getAutoCompleteAddress(
    address: string,
    token: string,
    country?: string,
  ): Promise<AutocompleteSanitizedResult[] | undefined> {
    if (!isDefined(address) || address.trim().length === 0) {
      return [];
    }
    try {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&sessiontoken=${token}&key=${this.apiMapKey}`;

      if (isDefined(country) && country !== '') {
        url += `&components=country:${country}`;
      }
      const result = await this.httpService.axiosRef.get(url);

      if (result.data.status === 'OK') {
        return sanitizeAutocompleteResults(result.data.predictions);
      }

      return [];
    } catch (error) {
      return [];
    }
  }

  public async getAddressDetails(
    placeId: string,
    token: string,
  ): Promise<AddressFields | undefined> {
    try {
      const result = await this.httpService.axiosRef.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&sessiontoken=${token}&fields=address_components&key=${this.apiMapKey}`,
      );

      if (result.data.status === 'OK') {
        return sanitizePlaceDetailsResults(
          result.data.result?.address_components,
        );
      }

      return {};
    } catch (error) {
      return {};
    }
  }
}
