/* @license Enterprise */

import { Injectable, Logger, type OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import * as crypto from 'crypto';

import { isNonEmptyString } from '@sniptt/guards';
import { ENTERPRISE_INSTANCE_TYPE } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { IsNull, Repository } from 'typeorm';
import { v4 } from 'uuid';

import {
  AppTokenEntity,
  AppTokenType,
} from 'src/engine/core-modules/app-token/app-token.entity';
import {
  ENTERPRISE_JWT_DEV_PUBLIC_KEY,
  ENTERPRISE_JWT_PUBLIC_KEY,
} from 'src/engine/core-modules/enterprise/constants/enterprise-public-key.constant';
import {
  EnterpriseException,
  EnterpriseExceptionCode,
} from 'src/engine/core-modules/enterprise/enterprise.exception';
import {
  type EnterpriseInstanceMetadata,
  type EnterpriseKeyPayload,
  type EnterpriseLicenseInfo,
  type EnterpriseValidityPayload,
} from 'src/engine/core-modules/enterprise/types/enterprise-key-payload.type';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import {
  ConfigVariableException,
  ConfigVariableExceptionCode,
} from 'src/engine/core-modules/twenty-config/twenty-config.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { UserEntity } from 'src/engine/core-modules/user/user.entity';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

@Injectable()
export class EnterprisePlanService implements OnModuleInit {
  private readonly logger = new Logger(EnterprisePlanService.name);
  private cachedValidityPayload: EnterpriseValidityPayload | null = null;
  private cachedKeyPayload: EnterpriseKeyPayload | null = null;
  private lastRefreshRejectionCode: string | null = null;

  static readonly ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER_CODE =
    'ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER';

  static readonly ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED_CODE =
    'ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED';

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    @InjectRepository(AppTokenEntity)
    private readonly appTokenRepository: Repository<AppTokenEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
  ) {}

  async onModuleInit() {
    this.refreshKeyPayload();
    await this.loadValidityToken();
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

  private async loadValidityToken(): Promise<void> {
    try {
      const dbToken = await this.appTokenRepository.findOne({
        where: {
          type: AppTokenType.EnterpriseValidityToken,
          userId: IsNull(),
          workspaceId: IsNull(),
          revokedAt: IsNull(),
        },
        order: { createdAt: 'DESC' },
      });

      const tokenValue =
        dbToken?.value ??
        this.twentyConfigService.get('ENTERPRISE_VALIDITY_TOKEN');

      if (!tokenValue) {
        this.cachedValidityPayload = null;

        return;
      }

      const payload = this.verifyJwt<EnterpriseValidityPayload>(tokenValue);

      if (payload && payload.status === 'valid') {
        this.cachedValidityPayload = payload;
      } else {
        this.cachedValidityPayload = null;
      }
    } catch (error) {
      this.logger.warn(
        `Failed to load validity token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      this.cachedValidityPayload = null;
    }
  }

  private async saveNewValidityTokenToDb(token: string): Promise<void> {
    const payload = this.verifyJwt<EnterpriseValidityPayload>(token);

    if (!isDefined(payload)) {
      return;
    }

    await this.appTokenRepository.manager.transaction(
      async (transactionalEntityManager) => {
        await transactionalEntityManager.update(
          this.appTokenRepository.target,
          {
            type: AppTokenType.EnterpriseValidityToken,
            userId: IsNull(),
            workspaceId: IsNull(),
            revokedAt: IsNull(),
          },
          { revokedAt: new Date() },
        );

        await transactionalEntityManager.save(this.appTokenRepository.target, {
          type: AppTokenType.EnterpriseValidityToken,
          value: token,
          userId: null,
          workspaceId: null,
          expiresAt: new Date(payload.exp * 1000),
        });
      },
    );
  }

  hasValidSignedEnterpriseKey(): boolean {
    this.refreshKeyPayload();
    return isDefined(this.cachedKeyPayload);
  }

  hasValidEnterpriseValidityToken(): boolean {
    if (isDefined(this.cachedValidityPayload)) {
      const now = Math.floor(Date.now() / 1000);

      return this.cachedValidityPayload.exp > now;
    }

    return false;
  }

  isValid(): boolean {
    return this.hasValidEnterpriseValidityToken();
  }

  isValidEnterpriseKeyFormat(key: string): boolean {
    return this.verifyJwt<EnterpriseKeyPayload>(key) !== null;
  }

  async getLicenseInfo(): Promise<EnterpriseLicenseInfo> {
    this.refreshKeyPayload();
    await this.loadValidityToken();

    if (isDefined(this.cachedValidityPayload)) {
      const now = Math.floor(Date.now() / 1000);

      return {
        isValid: this.cachedValidityPayload.exp > now,
        licensee: this.cachedKeyPayload?.licensee ?? null,
        expiresAt: new Date(this.cachedValidityPayload.exp * 1000),
        subscriptionId: this.cachedValidityPayload.sub,
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

  getLastRefreshRejectionCode(): string | null {
    return this.lastRefreshRejectionCode;
  }

  private async revokeStoredValidityToken(): Promise<void> {
    this.cachedValidityPayload = null;

    try {
      await this.appTokenRepository.update(
        {
          type: AppTokenType.EnterpriseValidityToken,
          userId: IsNull(),
          workspaceId: IsNull(),
          revokedAt: IsNull(),
        },
        { revokedAt: new Date() },
      );
    } catch (error) {
      this.logger.warn(
        `Failed to revoke stored validity token: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }

  async refreshValidityToken(): Promise<boolean> {
    this.lastRefreshRejectionCode = null;

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
      const instanceMetadata = await this.gatherInstanceMetadata();

      const response = await fetch(validateUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterpriseKey, instanceMetadata }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        this.logger.warn(
          `Enterprise refresh failed with status ${response.status}: ${errorData.error ?? 'Unknown error'}`,
        );

        if (
          errorData.code ===
          EnterprisePlanService.ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED_CODE
        ) {
          // Rate limited: the existing token stays valid, surface the reason so
          // callers (e.g. the manual refresh button) can tell the user.
          throw new EnterpriseException(
            'Validity token refresh rate limit exceeded',
            EnterpriseExceptionCode.ENTERPRISE_VALIDITY_TOKEN_RATE_LIMITED,
          );
        }

        if (isNonEmptyString(errorData.code)) {
          this.lastRefreshRejectionCode = errorData.code;
        }

        // Only a key claimed by a different server means this instance is
        // definitively displaced, so revoke its stored license. Other
        // rejections (missing SERVER_ID, dev-needs-prod, dev-slot-taken) are
        // recoverable: the existing token simply expires without reissue.
        if (
          errorData.code ===
          EnterprisePlanService.ENTERPRISE_KEY_BOUND_TO_ANOTHER_SERVER_CODE
        ) {
          await this.revokeStoredValidityToken();
        }

        return false;
      }

      const data = await response.json();

      if (!data.validityToken) {
        this.logger.warn('Enterprise refresh response missing validityToken');

        return false;
      }

      await this.saveNewValidityTokenToDb(data.validityToken);
      await this.loadValidityToken();

      this.logger.log('Enterprise validity token refreshed successfully');

      return true;
    } catch (error) {
      if (error instanceof EnterpriseException) {
        throw error;
      }

      this.logger.warn(
        `Enterprise refresh failed: ${error instanceof Error ? error.message : 'Network error'}. Current validity token will continue to work until expiration.`,
      );

      return false;
    }
  }

  // Self-hosted pricing is per user: a user who belongs to several workspaces
  // on the same instance only counts as one seat.
  async getBillableSeatCount(): Promise<number> {
    const result = await this.userWorkspaceRepository
      .createQueryBuilder('userWorkspace')
      .select('COUNT(DISTINCT "userWorkspace"."userId")', 'distinctUserCount')
      .where('"userWorkspace"."deletedAt" IS NULL')
      .getRawOne<{ distinctUserCount: string }>();

    return Math.max(1, Number(result?.distinctUserCount ?? 0));
  }

  async reportSeats(seatCount: number): Promise<boolean> {
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
      const instanceMetadata = await this.gatherInstanceMetadata();

      const response = await fetch(seatsUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterpriseKey, seatCount, instanceMetadata }),
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

  async releaseServerBinding(): Promise<boolean> {
    const enterpriseKey = this.twentyConfigService.get('ENTERPRISE_KEY');

    if (!enterpriseKey) {
      return false;
    }

    this.refreshKeyPayload();

    if (!isDefined(this.cachedKeyPayload)) {
      return false;
    }

    const apiUrl = this.twentyConfigService.get('ENTERPRISE_API_URL');
    const releaseUrl = `${apiUrl}/release`;

    try {
      const instanceMetadata = await this.gatherInstanceMetadata();

      const response = await fetch(releaseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enterpriseKey, instanceMetadata }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        this.logger.warn(
          `Enterprise binding release failed with status ${response.status}: ${errorData.error ?? 'Unknown error'}`,
        );

        if (
          errorData.code ===
          EnterpriseExceptionCode.ENTERPRISE_RELEASE_RATE_LIMITED
        ) {
          throw new EnterpriseException(
            'Enterprise server binding release rate limit reached',
            EnterpriseExceptionCode.ENTERPRISE_RELEASE_RATE_LIMITED,
          );
        }

        return false;
      }

      this.logger.log('Enterprise server binding released successfully');

      return true;
    } catch (error) {
      if (error instanceof EnterpriseException) {
        throw error;
      }

      this.logger.warn(
        `Enterprise binding release failed: ${error instanceof Error ? error.message : 'Network error'}`,
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

  async getOrCreateServerId(): Promise<string | null> {
    const existingServerId = this.twentyConfigService.get('SERVER_ID');

    if (isNonEmptyString(existingServerId)) {
      return existingServerId;
    }

    const newServerId = v4();

    try {
      await this.twentyConfigService.set('SERVER_ID', newServerId);

      return newServerId;
    } catch (error) {
      this.logger.warn(
        `Could not persist a generated SERVER_ID: ${error instanceof Error ? error.message : 'Unknown error'}. Set SERVER_ID in your .env file.`,
      );

      return null;
    }
  }

  private async gatherInstanceMetadata(): Promise<EnterpriseInstanceMetadata> {
    return {
      serverId: await this.getOrCreateServerId(),
      instanceType:
        this.twentyConfigService.get('ENTERPRISE_INSTANCE_TYPE') ??
        ENTERPRISE_INSTANCE_TYPE.PRODUCTION,
      serverUrl: this.twentyConfigService.get('SERVER_URL') ?? null,
      appVersion: this.twentyConfigService.get('APP_VERSION') ?? null,
      nodeEnv: this.twentyConfigService.get('NODE_ENV') ?? null,
      telemetryEnabled:
        this.twentyConfigService.get('TELEMETRY_ENABLED') ?? null,
      workspaceCount: await this.safeCount(() =>
        this.workspaceRepository.count(),
      ),
      activeUserWorkspaceCount: await this.safeCount(() =>
        this.userWorkspaceRepository.count({ where: { deletedAt: IsNull() } }),
      ),
      distinctUserCount: await this.safeCount(() =>
        this.userRepository.count({ where: { deletedAt: IsNull() } }),
      ),
      adminContactEmail: await this.getAdminContactEmail(),
      sentAt: new Date().toISOString(),
    };
  }

  private async safeCount(
    countFn: () => Promise<number>,
  ): Promise<number | null> {
    try {
      return await countFn();
    } catch {
      return null;
    }
  }

  private async getAdminContactEmail(): Promise<string | null> {
    try {
      const user = await this.userRepository.findOne({
        where: { deletedAt: IsNull() },
        order: { createdAt: 'ASC' },
        select: { email: true },
      });

      return user?.email ?? null;
    } catch {
      return null;
    }
  }

  // In development and Jest integration tests, tries both keys so production keys
  // work locally
  private getPublicKeysToTry(): string[] {
    const nodeEnv = this.twentyConfigService.get('NODE_ENV');

    if (
      nodeEnv === NodeEnvironment.DEVELOPMENT ||
      nodeEnv === NodeEnvironment.TEST
    ) {
      return [ENTERPRISE_JWT_PUBLIC_KEY, ENTERPRISE_JWT_DEV_PUBLIC_KEY];
    }

    return [ENTERPRISE_JWT_PUBLIC_KEY];
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

      const publicKeys = this.getPublicKeysToTry();

      for (const publicKey of publicKeys) {
        const isValid = crypto.verify(
          'sha256',
          Buffer.from(signingInput),
          {
            key: publicKey,
            padding: crypto.constants.RSA_PKCS1_PADDING,
          },
          signatureBuffer,
        );

        if (isValid) {
          const payloadStr = Buffer.from(
            encodedPayload.replace(/-/g, '+').replace(/_/g, '/') +
              '='.repeat((4 - (encodedPayload.length % 4)) % 4),
            'base64',
          ).toString('utf-8');

          return JSON.parse(payloadStr) as T;
        }
      }

      return null;
    } catch {
      return null;
    }
  }
}
