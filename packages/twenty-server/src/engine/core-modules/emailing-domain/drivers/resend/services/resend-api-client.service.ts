import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, parseJson } from 'twenty-shared/utils';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import { type ResendDomain } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-domain.type';
import { type ResendErrorBody } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-error-body.type';
import { type ResendReceivedEmail } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-received-email.type';
import { type ResendSendEmailPayload } from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-send-email-payload.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const RESEND_API_BASE_URL = 'https://api.resend.com';

@Injectable()
export class ResendApiClientService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async sendEmail(payload: ResendSendEmailPayload): Promise<{ id: string }> {
    return this.requestJson<{ id: string }>('POST', '/emails', payload);
  }

  async createDomain(payload: {
    name: string;
    region?: string;
  }): Promise<ResendDomain> {
    return this.requestJson<ResendDomain>('POST', '/domains', payload);
  }

  async getDomain(domainId: string): Promise<ResendDomain> {
    return this.requestJson<ResendDomain>('GET', `/domains/${domainId}`);
  }

  async listDomains(): Promise<{ data: ResendDomain[] }> {
    return this.requestJson<{ data: ResendDomain[] }>('GET', '/domains');
  }

  async verifyDomain(domainId: string): Promise<void> {
    await this.performRequest('POST', `/domains/${domainId}/verify`);
  }

  async deleteDomain(domainId: string): Promise<void> {
    await this.performRequest('DELETE', `/domains/${domainId}`);
  }

  async getReceivedEmail(emailId: string): Promise<ResendReceivedEmail> {
    return this.requestJson<ResendReceivedEmail>(
      'GET',
      `/emails/receiving/${emailId}`,
    );
  }

  // raw download URLs are pre-signed by Resend and require no Authorization
  async downloadRawEmail(downloadUrl: string): Promise<Buffer> {
    const response = await fetch(downloadUrl);

    if (!response.ok) {
      throw new EmailingDomainDriverException(
        `Failed to download raw email content (status ${response.status})`,
        EmailingDomainDriverExceptionCode.TEMPORARY_ERROR,
      );
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private getApiKeyOrThrow(): string {
    const apiKey = this.twentyConfigService.get('RESEND_API_KEY');

    if (!isNonEmptyString(apiKey)) {
      throw new EmailingDomainDriverException(
        'RESEND_API_KEY is not configured',
        EmailingDomainDriverExceptionCode.CONFIGURATION_ERROR,
      );
    }

    return apiKey;
  }

  private async requestJson<T>(
    method: string,
    path: string,
    body?: object,
  ): Promise<T> {
    const responseText = await this.performRequest(method, path, body);
    const parsedResponse = parseJson<T>(responseText);

    if (!isDefined(parsedResponse)) {
      throw new EmailingDomainDriverException(
        `Resend API ${method} ${path} returned an unparsable response`,
        EmailingDomainDriverExceptionCode.UNKNOWN,
      );
    }

    return parsedResponse;
  }

  private async performRequest(
    method: string,
    path: string,
    body?: object,
  ): Promise<string> {
    const response = await fetch(`${RESEND_API_BASE_URL}${path}`, {
      method,
      headers: {
        Authorization: `Bearer ${this.getApiKeyOrThrow()}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const responseText = await response.text();

    if (!response.ok) {
      throw this.buildException(response.status, responseText, method, path);
    }

    return responseText;
  }

  private buildException(
    status: number,
    responseText: string,
    method: string,
    path: string,
  ): EmailingDomainDriverException {
    const errorBody = parseJson<ResendErrorBody>(responseText);
    const providerMessage = isNonEmptyString(errorBody?.message)
      ? `: ${errorBody.message}`
      : '';

    return new EmailingDomainDriverException(
      `Resend API ${method} ${path} failed with status ${status}${providerMessage}`,
      this.mapStatusToExceptionCode(status),
    );
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
