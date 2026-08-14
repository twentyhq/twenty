import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, parseJson } from 'twenty-shared/utils';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type MailgunDomainResponse } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/types/mailgun-domain-response.type';
import { type MailgunErrorBody } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/types/mailgun-error-body.type';
import { type MailgunSendMessageResponse } from 'src/engine/core-modules/emailing-domain/drivers/mailgun/types/mailgun-send-message-response.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class MailgunApiClientService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async sendMessage(
    domain: string,
    form: FormData,
  ): Promise<MailgunSendMessageResponse> {
    const response = await fetch(
      `${this.getApiBaseUrl()}/v3/${domain}/messages`,
      {
        method: 'POST',
        headers: { Authorization: this.getAuthorizationHeaderOrThrow() },
        body: form,
      },
    );

    return this.parseResponse<MailgunSendMessageResponse>(
      response,
      'POST',
      `/v3/${domain}/messages`,
    );
  }

  async createDomain(domainName: string): Promise<MailgunDomainResponse> {
    const form = new FormData();

    form.append('name', domainName);

    const response = await fetch(`${this.getApiBaseUrl()}/v4/domains`, {
      method: 'POST',
      headers: { Authorization: this.getAuthorizationHeaderOrThrow() },
      body: form,
    });

    return this.parseResponse<MailgunDomainResponse>(
      response,
      'POST',
      '/v4/domains',
    );
  }

  async getDomain(domainName: string): Promise<MailgunDomainResponse> {
    const response = await fetch(
      `${this.getApiBaseUrl()}/v4/domains/${domainName}`,
      {
        headers: { Authorization: this.getAuthorizationHeaderOrThrow() },
      },
    );

    return this.parseResponse<MailgunDomainResponse>(
      response,
      'GET',
      `/v4/domains/${domainName}`,
    );
  }

  async verifyDomain(domainName: string): Promise<MailgunDomainResponse> {
    const response = await fetch(
      `${this.getApiBaseUrl()}/v4/domains/${domainName}/verify`,
      {
        method: 'PUT',
        headers: { Authorization: this.getAuthorizationHeaderOrThrow() },
      },
    );

    return this.parseResponse<MailgunDomainResponse>(
      response,
      'PUT',
      `/v4/domains/${domainName}/verify`,
    );
  }

  async deleteDomain(domainName: string): Promise<void> {
    const response = await fetch(
      `${this.getApiBaseUrl()}/v3/domains/${domainName}`,
      {
        method: 'DELETE',
        headers: { Authorization: this.getAuthorizationHeaderOrThrow() },
      },
    );

    await this.assertOkResponse(
      response,
      'DELETE',
      `/v3/domains/${domainName}`,
    );
  }

  async fetchStoredMessageMime(messageUrl: string): Promise<Buffer> {
    this.assertAllowedStorageUrl(messageUrl);

    const response = await fetch(messageUrl, {
      headers: {
        Authorization: this.getAuthorizationHeaderOrThrow(),
        Accept: 'message/rfc2822',
      },
    });

    const { 'body-mime': bodyMime } = await this.parseResponse<{
      'body-mime'?: string;
    }>(response, 'GET', messageUrl);

    if (!isNonEmptyString(bodyMime)) {
      throw new EmailingDomainDriverException(
        `Stored message at ${messageUrl} has no MIME body`,
        EmailingDomainDriverExceptionCode.NOT_FOUND,
      );
    }

    return Buffer.from(bodyMime, 'utf8');
  }

  async deleteStoredMessage(messageUrl: string): Promise<void> {
    this.assertAllowedStorageUrl(messageUrl);

    const response = await fetch(messageUrl, {
      method: 'DELETE',
      headers: { Authorization: this.getAuthorizationHeaderOrThrow() },
    });

    if (response.ok || response.status === 404) {
      return;
    }

    await this.assertOkResponse(response, 'DELETE', messageUrl);
  }

  // storage URLs come from webhook payloads; only fetch them when they
  // target Mailgun API hosts so a forged payload cannot make the server
  // call arbitrary URLs with credentials attached
  private assertAllowedStorageUrl(messageUrl: string): void {
    let parsedUrl: URL;

    try {
      parsedUrl = new URL(messageUrl);
    } catch {
      throw new EmailingDomainDriverException(
        `Invalid Mailgun storage URL: ${messageUrl}`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    const apiHostname = new URL(this.getApiBaseUrl()).hostname;
    const isAllowed =
      parsedUrl.protocol === 'https:' &&
      (parsedUrl.hostname === apiHostname ||
        parsedUrl.hostname.endsWith('.mailgun.net'));

    if (!isAllowed) {
      throw new EmailingDomainDriverException(
        `Refusing to fetch non-Mailgun storage URL: ${messageUrl}`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }
  }

  private getApiBaseUrl(): string {
    const apiBaseUrl = this.twentyConfigService.get('MAILGUN_API_BASE_URL');

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(apiBaseUrl);
    } catch {
      throw new EmailingDomainDriverException(
        `MAILGUN_API_BASE_URL is not a valid URL: ${apiBaseUrl}`,
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    if (parsedUrl.protocol !== 'https:') {
      throw new EmailingDomainDriverException(
        'MAILGUN_API_BASE_URL must be an https URL',
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    return apiBaseUrl.replace(/\/$/, '');
  }

  private getAuthorizationHeaderOrThrow(): string {
    const apiKey = this.twentyConfigService.get('MAILGUN_API_KEY');

    if (!isNonEmptyString(apiKey)) {
      throw new EmailingDomainDriverException(
        'MAILGUN_API_KEY is not configured',
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    return `Basic ${Buffer.from(`api:${apiKey}`).toString('base64')}`;
  }

  private async parseResponse<T>(
    response: Response,
    method: string,
    path: string,
  ): Promise<T> {
    const responseText = await this.assertOkResponse(response, method, path);
    const parsedResponse = parseJson<T>(responseText);

    if (!isDefined(parsedResponse)) {
      throw new EmailingDomainDriverException(
        `Mailgun API ${method} ${path} returned an unparsable response`,
        EmailingDomainDriverExceptionCode.UNKNOWN,
      );
    }

    return parsedResponse;
  }

  private async assertOkResponse(
    response: Response,
    method: string,
    path: string,
  ): Promise<string> {
    const responseText = await response.text();

    if (!response.ok) {
      const errorBody = parseJson<MailgunErrorBody>(responseText);
      const providerMessage = errorBody?.message ?? errorBody?.Error;

      throw new EmailingDomainDriverException(
        `Mailgun API ${method} ${path} failed with status ${response.status}${
          isNonEmptyString(providerMessage) ? `: ${providerMessage}` : ''
        }`,
        this.mapStatusToExceptionCode(response.status),
      );
    }

    return responseText;
  }

  private mapStatusToExceptionCode(
    status: number,
  ): EmailingDomainDriverExceptionCode {
    if (status === 404) {
      return EmailingDomainDriverExceptionCode.NOT_FOUND;
    }

    if (status === 401 || status === 403) {
      return EmailingDomainDriverExceptionCode.INSUFFICIENT_PERMISSIONS;
    }

    if (status === 429 || status >= 500) {
      return EmailingDomainDriverExceptionCode.TEMPORARY_ERROR;
    }

    if (status >= 400) {
      return EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR;
    }

    return EmailingDomainDriverExceptionCode.UNKNOWN;
  }
}
