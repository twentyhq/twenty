/* @license Enterprise */

import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as crypto from 'crypto';

import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import { ENTERPRISE_PUBLIC_KEY } from 'src/engine/core-modules/enterprise/constants/enterprise-public-key.constant';
import { ENTERPRISE_VALIDITY_TOKEN_DEFAULT_EXPIRATION_MS } from 'src/engine/core-modules/enterprise/constants/enterprise-validity-token-default-expiration-days.constant';
import {
  type EnterpriseKeyPayload,
  type EnterpriseLicenseInfo,
  type EnterpriseValidityPayload,
} from 'src/engine/core-modules/enterprise/types/enterprise-key-payload.type';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';

@Injectable()
export class EnterprisePlanService implements OnModuleInit {
  private readonly logger = new Logger(EnterprisePlanService.name);
  private cachedValidityPayload: EnterpriseValidityPayload | null = null;
  private cachedKeyPayload: EnterpriseKeyPayload | null = null;

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
  ) {}

  async onModuleInit() {
    this.refreshKeyPayload();
    await this.loadValidityTokenFromDb();
  }

  private refreshKeyPayload(): void {
    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey) {
      this.cachedKeyPayload = null;

      return;
    }

    const payload = this.verifyJwt<EnterpriseKeyPayload>(enterpriseKey);

    this.cachedKeyPayload = payload;
  }

  private async loadValidityTokenFromDb(): Promise<void> {
    try {
      const validityToken = await this.appTokenRepository.findOne({
        where: {
          type: AppTokenType.EnterpriseValidityToken,
          userId: IsNull(),
          workspaceId: IsNull(),
          revokedAt: IsNull(),
        },
        order: { createdAt: 'DESC' },
      });

      if (!validityToken?.value) {
        this.cachedValidityPayload = null;

        return;
      }

      const payload = this.verifyJwt<EnterpriseValidityPayload>(
        validityToken.value,
      );

      if (payload && payload.status === 'valid') {
        this.cachedValidityPayload = payload;
      } else {
        this.cachedValidityPayload = null;
      }
    } catch (error) {
      this.logger.warn(
        `Failed to load validity token from DB: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.cachedValidityPayload = null;
    }
  }

  private async saveNewValidityTokenToDb(token: string): Promise<void> {
    await this.appTokenRepository.update(
      {
        type: AppTokenType.EnterpriseValidityToken,
        userId: IsNull(),
        workspaceId: IsNull(),
        revokedAt: IsNull(),
      },
      { revokedAt: new Date() },
    );

    const payload = this.verifyJwt<EnterpriseValidityPayload>(token);

    await this.appTokenRepository.save({
      type: AppTokenType.EnterpriseValidityToken,
      value: token,
      userId: null,
      workspaceId: null,
      expiresAt: payload?.exp
        ? new Date(payload.exp * 1000)
        : new Date(
            Date.now() + ENTERPRISE_VALIDITY_TOKEN_DEFAULT_EXPIRATION_MS,
          ),
    });
  }

  hasValidSignedEnterpriseKey(): boolean {
    if (this.twentyConfigService.isBillingEnabled()) {
      return true;
    }

    return isDefined(this.cachedKeyPayload);
  }

  hasValidEnterpriseValidityToken(): boolean {
    if (this.twentyConfigService.isBillingEnabled()) {
      return true;
    }

    if (isDefined(this.cachedValidityPayload)) {
      const now = Math.floor(Date.now() / 1000);

      return this.cachedValidityPayload.exp > now;
    }

    return false;
  }

  hasValidEnterpriseKey(): boolean {
    if (this.hasValidSignedEnterpriseKey()) {
      return true;
    }

    return this.checkLegacyKey();
  }

  isValid(): boolean {
    if (this.hasValidEnterpriseValidityToken()) {
      return true;
    }

    return this.checkLegacyKey(); // temporary
  }

  isValidEnterpriseKeyFormat(key: string): boolean {
    return this.verifyJwt<EnterpriseKeyPayload>(key) !== null;
  }

  private checkLegacyKey(): boolean {
    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!isDefined(enterpriseKey)) {
      return false;
    }

    this.logger.warn(
      'Unsigned enterprise keys are deprecated and will stop working ' +
        'in a future version. Please obtain a signed key from twenty.com.',
    );

    return true;
  }

  async getLicenseInfo(): Promise<EnterpriseLicenseInfo> {
    if (this.twentyConfigService.isBillingEnabled()) {
      return {
        isValid: true,
        licensee: null,
        expiresAt: null,
        subscriptionId: null,
      };
    }

    this.refreshKeyPayload();
    await this.loadValidityTokenFromDb();

    if (isDefined(this.cachedValidityPayload)) {
      const now = Math.floor(Date.now() / 1000);

      return {
        isValid: this.cachedValidityPayload.exp > now,
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

  async setEnterpriseKey(enterpriseKey: string): Promise<void> {
    try {
      await this.twentyConfigService.set('ENTERPRISE_KEY', enterpriseKey);
    } catch (error) {
      if (
        error instanceof ConfigVariableException &&
        error.code === ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED
      ) {
        throw new ConfigVariableException(
          'IS_CONFIG_VARIABLES_IN_DB_ENABLED is false on your server. ' +
            'Please add ENTERPRISE_KEY to your .env file manually.',
          ConfigVariableExceptionCode.DATABASE_CONFIG_DISABLED,
        );
      }

      throw error;
    }
  }

  async refreshValidityToken(): Promise<boolean> {
    if (this.twentyConfigService.isBillingEnabled()) {
      return true;
    }

    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey) {
      this.logger.warn('No ENTERPRISE_KEY configured, skipping refresh');

      return false;
    }

    this.refreshKeyPayload();

    if (!isDefined(this.cachedKeyPayload)) {
      this.logger.warn(
        'ENTERPRISE_KEY is not a valid signed JWT, skipping refresh',
      );

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
          `Enterprise refresh failed with status ${response.status}: ${errorData.error ?? 'Unknown error'}`,
        );

        return false;
      }

      const data = await response.json();

      if (!data.validityToken) {
        this.logger.warn('Enterprise refresh response missing validityToken');

        return false;
      }

      await this.saveNewValidityTokenToDb(data.validityToken);
      await this.loadValidityTokenFromDb();

      this.logger.log('Enterprise validity token refreshed successfully');

      return true;
    } catch (error) {
      this.logger.warn(
        `Enterprise refresh failed: ${error instanceof Error ? error.message : 'Network error'}. Current validity token will continue to work until expiration.`,
      );

      return false;
    }
  }

  async reportSeats(seatCount: number): Promise<boolean> {
    if (this.twentyConfigService.isBillingEnabled()) {
      return false;
    }

    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey) {
      return false;
    }

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
    if (this.twentyConfigService.isBillingEnabled()) {
      return null;
    }

    this.refreshKeyPayload();

    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey || !isDefined(this.cachedKeyPayload)) {
      return null;
    }

    const licenseInfo = await this.getLicenseInfo();
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
    if (this.twentyConfigService.isBillingEnabled()) {
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

  async getCheckoutUrl(
    billingInterval: 'monthly' | 'yearly' = 'monthly',
    seatCount: number,
  ): Promise<string | null> {
    if (this.twentyConfigService.isBillingEnabled()) {
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
        body: JSON.stringify({ billingInterval, seatCount }),
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
