/* @license Enterprise */

import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';

import * as crypto from 'crypto';

import { isDefined } from 'twenty-shared/utils';

import { ENTERPRISE_PUBLIC_KEY } from 'src/engine/core-modules/enterprise/constants/enterprise-public-key.constant';
import {
  type EnterpriseKeyPayload,
  type EnterpriseLicenseInfo,
  type EnterpriseValidityPayload,
} from 'src/engine/core-modules/enterprise/types/enterprise-key-payload.type';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class EnterpriseKeyService implements OnModuleInit {
  private readonly logger = new Logger(EnterpriseKeyService.name);
  private cachedValidityPayload: EnterpriseValidityPayload | null = null;
  private cachedKeyPayload: EnterpriseKeyPayload | null = null;

  constructor(private readonly twentyConfigService: TwentyConfigService) {}

  onModuleInit() {
    this.refreshFromConfig();
  }

  refreshFromConfig(): void {
    this.refreshKeyPayload();
    this.refreshValidityPayload();
  }

  private refreshKeyPayload(): void {
    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey) {
      this.cachedKeyPayload = null;

      return;
    }

    const payload = this.verifyJwt<EnterpriseKeyPayload>(enterpriseKey);

    if (payload) {
      this.cachedKeyPayload = payload;
    } else {
      this.cachedKeyPayload = null;
    }
  }

  private refreshValidityPayload(): void {
    const validityToken = this.twentyConfigService.get(
      'ENTERPRISE_VALIDITY_TOKEN',
    );

    if (!validityToken) {
      this.cachedValidityPayload = null;

      return;
    }

    const payload = this.verifyJwt<EnterpriseValidityPayload>(validityToken);

    if (payload && payload.status === 'valid') {
      this.cachedValidityPayload = payload;
    } else {
      this.cachedValidityPayload = null;
    }
  }

  isValid(): boolean {
    // On cloud, enterprise features are managed by the billing system
    if (!this.twentyConfigService.isSelfHost()) {
      return true;
    }

    // Re-read from config cache to pick up DB changes (refreshed every 15s)
    this.refreshValidityPayload();

    if (isDefined(this.cachedValidityPayload)) {
      const now = Math.floor(Date.now() / 1000);

      return this.cachedValidityPayload.exp > now;
    }

    // Backward compatibility: if no validity token exists but ENTERPRISE_KEY
    // is set as a plain string (not a JWT), allow it with a deprecation warning
    return this.checkLegacyKey();
  }

  private checkLegacyKey(): boolean {
    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey) {
      return false;
    }

    // If it's a valid JWT signed by us, it needs a validity token
    if (isDefined(this.cachedKeyPayload)) {
      return false;
    }

    // Legacy plain-string key — allow with deprecation warning
    this.logger.warn(
      'Plain-text enterprise keys are deprecated and will stop working ' +
        'in a future version. Please obtain a signed key from twenty.com.',
    );

    return true;
  }

  getLicenseInfo(): EnterpriseLicenseInfo {
    if (!this.twentyConfigService.isSelfHost()) {
      return {
        isValid: true,
        licensee: null,
        expiresAt: null,
        subscriptionId: null,
      };
    }

    this.refreshFromConfig();

    if (isDefined(this.cachedValidityPayload)) {
      return {
        isValid: this.cachedValidityPayload.exp > Math.floor(Date.now() / 1000),
        licensee: this.cachedKeyPayload?.licensee ?? null,
        expiresAt: new Date(this.cachedValidityPayload.exp * 1000),
        subscriptionId: this.cachedValidityPayload.sub,
      };
    }

    if (this.checkLegacyKey()) {
      return {
        isValid: true,
        licensee: null,
        expiresAt: null,
        subscriptionId: null,
      };
    }

    return {
      isValid: false,
      licensee: null,
      expiresAt: null,
      subscriptionId: null,
    };
  }

  async validateAndRefresh(): Promise<boolean> {
    if (!this.twentyConfigService.isSelfHost()) {
      return true;
    }

    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey) {
      this.logger.warn('No ENTERPRISE_KEY configured, skipping validation');

      return false;
    }

    const apiUrl = this.twentyConfigService.get('ENTERPRISE_API_URL');
    const validateUrl = `${apiUrl}/validate`;

    try {
      const response = await fetch(validateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterpriseKey }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        this.logger.warn(
          `Enterprise validation failed with status ${response.status}: ${errorData.error ?? 'Unknown error'}`,
        );

        return false;
      }

      const data = await response.json();

      if (!data.validityToken) {
        this.logger.warn(
          'Enterprise validation response missing validityToken',
        );

        return false;
      }

      await this.twentyConfigService.set(
        'ENTERPRISE_VALIDITY_TOKEN',
        data.validityToken,
      );

      this.refreshValidityPayload();

      this.logger.log('Enterprise key validated successfully');

      return true;
    } catch (error) {
      this.logger.warn(
        `Enterprise validation failed: ${error instanceof Error ? error.message : 'Network error'}. Current validity token will continue to work until expiration.`,
      );

      return false;
    }
  }

  async reportSeats(seatCount: number): Promise<boolean> {
    if (!this.twentyConfigService.isSelfHost()) {
      return false;
    }

    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey) {
      return false;
    }

    // Only report seats for properly signed keys (not legacy plain-string keys)
    if (!isDefined(this.cachedKeyPayload)) {
      return false;
    }

    const apiUrl = this.twentyConfigService.get('ENTERPRISE_API_URL');
    const seatsUrl = `${apiUrl}/seats`;

    try {
      const response = await fetch(seatsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterpriseKey, seatCount }),
      });

      if (!response.ok) {
        this.logger.warn(
          `Seat reporting failed with status ${response.status}`,
        );

        return false;
      }

      this.logger.log(`Reported ${seatCount} seats to enterprise API`);

      return true;
    } catch (error) {
      this.logger.warn(
        `Seat reporting failed: ${error instanceof Error ? error.message : 'Network error'}`,
      );

      return false;
    }
  }

  async getSubscriptionStatus(): Promise<{
    status: string;
    licensee: string | null;
    expiresAt: Date | null;
    cancelAt: Date | null;
    currentPeriodEnd: Date | null;
    isCancellationScheduled: boolean;
  } | null> {
    if (!this.twentyConfigService.isSelfHost()) {
      return null;
    }

    this.refreshKeyPayload();

    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey || !isDefined(this.cachedKeyPayload)) {
      return null;
    }

    const licenseInfo = this.getLicenseInfo();
    const apiUrl = this.twentyConfigService.get('ENTERPRISE_API_URL');
    const statusUrl = `${apiUrl}/status`;

    try {
      const response = await fetch(statusUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterpriseKey }),
      });

      if (!response.ok) {
        this.logger.warn(
          `Enterprise status request failed with status ${response.status}`,
        );

        return null;
      }

      const data = await response.json();

      return {
        status: data.status,
        licensee: licenseInfo.licensee,
        expiresAt: licenseInfo.expiresAt,
        cancelAt: data.cancelAt ? new Date(data.cancelAt * 1000) : null,
        currentPeriodEnd: data.currentPeriodEnd
          ? new Date(data.currentPeriodEnd * 1000)
          : null,
        isCancellationScheduled: data.isCancellationScheduled ?? false,
      };
    } catch (error) {
      this.logger.warn(
        `Enterprise status request failed: ${error instanceof Error ? error.message : 'Network error'}`,
      );

      return null;
    }
  }

  async getPortalUrl(returnUrl?: string): Promise<string | null> {
    if (!this.twentyConfigService.isSelfHost()) {
      return null;
    }

    const apiUrl = this.twentyConfigService.get('ENTERPRISE_API_URL');

    if (!apiUrl) {
      return null;
    }

    this.refreshKeyPayload();
    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (enterpriseKey && isDefined(this.cachedKeyPayload)) {
      return this.requestPortalUrlWithKey(apiUrl, enterpriseKey, returnUrl);
    }

    return null;
  }

  private async requestPortalUrlWithKey(
    apiUrl: string,
    enterpriseKey: string,
    returnUrl?: string,
  ): Promise<string | null> {
    const portalUrl = `${apiUrl}/portal`;

    try {
      const response = await fetch(portalUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterpriseKey, returnUrl }),
      });

      if (!response.ok) {
        this.logger.warn(
          `Enterprise portal request failed with status ${response.status}`,
        );

        return null;
      }

      const data = await response.json();

      return data.url ?? null;
    } catch (error) {
      this.logger.warn(
        `Enterprise portal request failed: ${error instanceof Error ? error.message : 'Network error'}`,
      );

      return null;
    }
  }

  async getCheckoutUrl(): Promise<string | null> {
    if (!this.twentyConfigService.isSelfHost()) {
      return null;
    }

    this.refreshKeyPayload();
    if (isDefined(this.cachedKeyPayload)) {
      return null;
    }

    const apiUrl = this.twentyConfigService.get('ENTERPRISE_API_URL');

    if (!apiUrl) {
      return null;
    }

    const checkoutUrl = `${apiUrl}/checkout`;

    try {
      const response = await fetch(checkoutUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        this.logger.warn(
          `Enterprise checkout request failed with status ${response.status}`,
        );

        return null;
      }

      const data = await response.json();

      return data.url ?? null;
    } catch (error) {
      this.logger.warn(
        `Enterprise checkout request failed: ${error instanceof Error ? error.message : 'Network error'}`,
      );

      return null;
    }
  }

  private verifyJwt<T extends Record<string, unknown>>(
    token: string,
  ): T | null {
    try {
      const parts = token.split('.');

      if (parts.length !== 3) {
        return null;
      }

      const [encodedHeader, encodedPayload, signature] = parts;
      const signingInput = `${encodedHeader}.${encodedPayload}`;

      const signatureBuffer = Buffer.from(
        signature.replace(/-/g, '+').replace(/_/g, '/') +
          '='.repeat((4 - (signature.length % 4)) % 4),
        'base64',
      );

      const isValid = crypto.verify(
        'sha256',
        Buffer.from(signingInput),
        {
          key: ENTERPRISE_PUBLIC_KEY,
          padding: crypto.constants.RSA_PKCS1_PADDING,
        },
        signatureBuffer,
      );

      if (!isValid) {
        return null;
      }

      const payloadStr = Buffer.from(
        encodedPayload.replace(/-/g, '+').replace(/_/g, '/') +
          '='.repeat((4 - (encodedPayload.length % 4)) % 4),
        'base64',
      ).toString('utf-8');

      return JSON.parse(payloadStr) as T;
    } catch {
      return null;
    }
  }
}
