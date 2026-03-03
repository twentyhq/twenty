import { Injectable, Logger } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import {
  type AutocompleteSanitizedResult,
  sanitizeAutocompleteResults,
} from 'src/engine/core-modules/geo-map/utils/sanitize-autocomplete-results.util';
import {
  type AddressFields,
  sanitizePlaceDetailsResults,
} from 'src/engine/core-modules/geo-map/utils/sanitize-place-details-results.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class GeoMapService {
  private readonly logger = new Logger(GeoMapService.name);

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly secureHttpClientService: SecureHttpClientService,
  ) {}

  private getApiKey(): string | undefined {
    const isEnabled = this.twentyConfigService.get(
      'IS_MAPS_AND_ADDRESS_AUTOCOMPLETE_ENABLED',
    );

    if (!isEnabled) {
      this.logger.debug('Maps autocomplete is disabled');

      return undefined;
    }

    const apiKey = this.twentyConfigService.get('GOOGLE_MAP_API_KEY');

    if (!isNonEmptyString(apiKey)) {
      this.logger.warn(
        'Maps autocomplete is enabled but GOOGLE_MAP_API_KEY is not set',
      );

      return undefined;
    }

    return apiKey;
  }

  public async getAutoCompleteAddress(
    address: string,
    token: string,
    country?: string,
    isFieldCity?: boolean,
  ): Promise<AutocompleteSanitizedResult[] | undefined> {
    const apiKey = this.getApiKey();

    if (!apiKey || !isNonEmptyString(address?.trim())) {
      return [];
    }

    let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(address)}&sessiontoken=${token}&key=${apiKey}`;

    if (isNonEmptyString(country)) {
      url += `&components=country:${country}`;
    }
    if (isDefined(isFieldCity) && isFieldCity === true) {
      url += `&types=(cities)`;
    }

    try {
      const httpClient = this.secureHttpClientService.getHttpClient();
      const result = await httpClient.get(url);

      if (result.data.status === 'OK') {
        return sanitizeAutocompleteResults(result.data.predictions);
      }

      this.logger.warn(
        `Google Places autocomplete returned status: ${result.data.status}` +
          (result.data.error_message ? ` — ${result.data.error_message}` : ''),
      );
    } catch (error) {
      this.logger.error(
        'Google Places autocomplete request failed',
        error instanceof Error ? error.stack : error,
      );
    }

    return [];
  }

  public async getAddressDetails(
    placeId: string,
    token: string,
  ): Promise<AddressFields | undefined> {
    const apiKey = this.getApiKey();

    if (!apiKey) {
      return {};
    }

    try {
      const httpClient = this.secureHttpClientService.getHttpClient();

      const result = await httpClient.get(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&sessiontoken=${token}&fields=address_components%2Cgeometry&key=${apiKey}`,
      );

      if (result.data.status === 'OK') {
        return sanitizePlaceDetailsResults(
          result.data.result?.address_components,
          result.data.result?.geometry?.location,
        );
      }

      this.logger.warn(
        `Google Places details returned status: ${result.data.status}` +
          (result.data.error_message ? ` — ${result.data.error_message}` : ''),
      );
    } catch (error) {
      this.logger.error(
        'Google Places details request failed',
        error instanceof Error ? error.stack : error,
      );
    }

    return {};
  }
}
