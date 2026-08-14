import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { parseJson } from 'twenty-shared/utils';

import {
  EmailingDomainDriverException,
  EmailingDomainDriverExceptionCode,
} from 'src/engine/core-modules/emailing-domain/drivers/exceptions/emailing-domain-driver.exception';
import {
  type ResendDomain,
  type ResendErrorBody,
  type ResendReceivedEmail,
  type ResendSendEmailPayload,
} from 'src/engine/core-modules/emailing-domain/drivers/resend/types/resend-api.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

const RESEND_API_BASE_URL = 'https://api.resend.com';

@Injectable()
export class ResendApiClientService {
  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  async sendEmail(payload: ResendSendEmailPayload): Promise<{ id: string }> {
    return this.request<{ id: string }>('POST', '/emails', payload);
  }

  async createDomain(payload: {
    name: string;
    region?: string;
  }): Promise<ResendDomain> {
    return this.request<ResendDomain>('POST', '/domains', payload);
  }

  async getDomain(domainId: string): Promise<ResendDomain> {
    return this.request<ResendDomain>('GET', `/domains/${domainId}`);
  }

  async listDomains(): Promise<{ data: ResendDomain[] }> {
    return this.request<{ data: ResendDomain[] }>('GET', '/domains');
  }

  async verifyDomain(domainId: string): Promise<void> {
    await this.request('POST', `/domains/${domainId}/verify`);
  }

  async deleteDomain(domainId: string): Promise<void> {
    await this.request('DELETE', `/domains/${domainId}`);
  }

  async getReceivedEmail(emailId: string): Promise<ResendReceivedEmail> {
    return this.request<ResendReceivedEmail>(
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

  private async request<T>(
    method: string,
    path: string,
    body?: object,
  ): Promise<T> {
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

    return (
      responseText.length > 0 ? parseJson<T>(responseText) : undefined
    ) as T;
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
