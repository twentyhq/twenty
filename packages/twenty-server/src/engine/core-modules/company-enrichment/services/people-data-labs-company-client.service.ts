import { Injectable } from '@nestjs/common';

import { isNonEmptyString, isNumber, isObject } from '@sniptt/guards';
import { type AxiosInstance } from 'axios';
import { isDefined } from 'twenty-shared/utils';

import { PEOPLE_DATA_LABS_BASE_URL } from 'src/engine/core-modules/company-enrichment/constants/people-data-labs-base-url.constant';
import { PEOPLE_DATA_LABS_COMPANY_MIN_LIKELIHOOD } from 'src/engine/core-modules/company-enrichment/constants/people-data-labs-company-min-likelihood.constant';
import { PEOPLE_DATA_LABS_REQUEST_TIMEOUT_MS } from 'src/engine/core-modules/company-enrichment/constants/people-data-labs-request-timeout-ms.constant';
import { type PeopleDataLabsCompanyData } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-company-data.type';
import { type PeopleDataLabsCompanyEnrichResult } from 'src/engine/core-modules/company-enrichment/types/people-data-labs-company-enrich-result.type';
import { isTransientPeopleDataLabsStatus } from 'src/engine/core-modules/company-enrichment/utils/is-transient-people-data-labs-status.util';
import { parsePeopleDataLabsResponseItem } from 'src/engine/core-modules/company-enrichment/utils/parse-people-data-labs-response-item.util';
import { SecureHttpClientService } from 'src/engine/core-modules/secure-http-client/secure-http-client.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class PeopleDataLabsCompanyClientService {
  private readonly httpClient: AxiosInstance;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    secureHttpClientService: SecureHttpClientService,
  ) {
    this.httpClient = secureHttpClientService.getHttpClient({
      baseURL: PEOPLE_DATA_LABS_BASE_URL,
      timeout: PEOPLE_DATA_LABS_REQUEST_TIMEOUT_MS,
      validateStatus: () => true,
    });
  }

  async enrichCompanyByDomain(
    domain: string,
  ): Promise<PeopleDataLabsCompanyEnrichResult> {
    const apiKey = this.twentyConfigService
      .get('PEOPLE_DATA_LABS_API_KEY')
      ?.trim();

    if (!isNonEmptyString(apiKey)) {
      return { outcome: 'skipped' };
    }

    try {
      const response = await this.httpClient.get('/company/enrich', {
        params: {
          website: domain,
          min_likelihood: PEOPLE_DATA_LABS_COMPANY_MIN_LIKELIHOOD,
        },
        headers: { 'X-Api-Key': apiKey },
      });

      const responseBody = isObject(response.data)
        ? (response.data as Record<string, unknown>)
        : null;

      if (!isDefined(responseBody)) {
        if (response.status < 200 || response.status >= 300) {
          return this.classifyError({
            httpStatus: response.status,
            message: `PDL request failed (HTTP ${response.status}).`,
          });
        }

        return {
          outcome: 'transientError',
          httpStatus: response.status,
          message: 'People Data Labs returned a non-JSON response',
        };
      }

      // People Data Labs reports the outcome in the body, and can return a body
      // level 404 under an HTTP 200, so the body status wins when present.
      const parsed = parsePeopleDataLabsResponseItem<PeopleDataLabsCompanyData>(
        {
          item: {
            ...responseBody,
            status: isNumber(responseBody.status)
              ? responseBody.status
              : response.status,
          },
          requestedMinLikelihood: PEOPLE_DATA_LABS_COMPANY_MIN_LIKELIHOOD,
        },
      );

      if (parsed.outcome === 'not_found') {
        return { outcome: 'notFound' };
      }

      if (parsed.outcome === 'error') {
        return this.classifyError({
          httpStatus: parsed.httpStatus,
          message: parsed.message,
        });
      }

      return { outcome: 'matched', data: parsed.data };
    } catch (error) {
      return {
        outcome: 'transientError',
        httpStatus: 0,
        message: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private classifyError({
    httpStatus,
    message,
  }: {
    httpStatus: number;
    message: string;
  }): PeopleDataLabsCompanyEnrichResult {
    return httpStatus === 0 || isTransientPeopleDataLabsStatus(httpStatus)
      ? { outcome: 'transientError', httpStatus, message }
      : { outcome: 'permanentError', httpStatus, message };
  }
}
