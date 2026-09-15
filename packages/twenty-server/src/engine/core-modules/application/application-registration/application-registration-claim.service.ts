import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isNonEmptyString } from '@sniptt/guards';
import axios from 'axios';
import { isDefined } from 'twenty-shared/utils';
import { type Repository } from 'typeorm';
import { z } from 'zod';

import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  ApplicationRegistrationException,
  ApplicationRegistrationExceptionCode,
} from 'src/engine/core-modules/application/application-registration/application-registration.exception';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { type AdminApplicationRegistrationClaimDTO } from 'src/engine/core-modules/application/application-registration/dtos/admin-application-registration-claim.dto';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type ApplicationRegistrationGithubClaimStateJwtPayload } from 'src/engine/core-modules/auth/types/application-registration-github-claim-state-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';

const GITHUB_CLAIM_STATE_EXPIRES_IN = '15m';

const attestationsResponseSchema = z.object({
  attestations: z.array(
    z.object({
      predicateType: z.string(),
      bundle: z.object({
        dsseEnvelope: z.object({
          payload: z.string(),
        }),
      }),
    }),
  ),
});

const provenancePayloadSchema = z.object({
  predicate: z
    .object({
      buildDefinition: z
        .object({
          externalParameters: z
            .object({
              workflow: z.object({ repository: z.string() }).partial(),
            })
            .partial()
            .optional(),
        })
        .partial()
        .optional(),
      invocation: z
        .object({
          configSource: z.object({ uri: z.string() }).partial().optional(),
        })
        .partial()
        .optional(),
    })
    .partial(),
});

@Injectable()
export class ApplicationRegistrationClaimService {
  private readonly logger = new Logger(
    ApplicationRegistrationClaimService.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly applicationRegistrationService: ApplicationRegistrationService,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async buildGithubAuthorizationUrl(params: {
    applicationRegistrationId: string;
    workspaceId: string;
    userId: string | null;
  }): Promise<string> {
    const registration =
      await this.applicationRegistrationService.findOneByIdGlobal(
        params.applicationRegistrationId,
      );

    this.assertClaimable(registration);

    const clientId = this.twentyConfigService.get('APP_CLAIM_GITHUB_CLIENT_ID');

    if (!isNonEmptyString(clientId)) {
      throw new ApplicationRegistrationException(
        'GitHub OAuth app is not configured (APP_CLAIM_GITHUB_CLIENT_ID)',
        ApplicationRegistrationExceptionCode.CLAIM_NOT_CONFIGURED,
      );
    }

    const statePayload: ApplicationRegistrationGithubClaimStateJwtPayload = {
      sub: registration.id,
      type: JwtTokenTypeEnum.APPLICATION_REGISTRATION_GITHUB_CLAIM_STATE,
      applicationRegistrationId: registration.id,
      workspaceId: params.workspaceId,
      userId: params.userId,
    };

    const state = await this.jwtWrapperService.signAsyncOrThrow(statePayload, {
      expiresIn: GITHUB_CLAIM_STATE_EXPIRES_IN,
    });

    const authorizationUrl = new URL(
      'https://github.com/login/oauth/authorize',
    );

    authorizationUrl.searchParams.set('client_id', clientId);
    authorizationUrl.searchParams.set('scope', 'read:org');
    authorizationUrl.searchParams.set('redirect_uri', this.buildCallbackUrl());
    authorizationUrl.searchParams.set('state', state);
    // Always show the account picker: without it GitHub silently reuses the
    // previous authorization, leaving no way to retry with another account.
    authorizationUrl.searchParams.set('prompt', 'select_account');

    return authorizationUrl.toString();
  }

  async verifyClaimState(
    state: string,
  ): Promise<ApplicationRegistrationGithubClaimStateJwtPayload> {
    await this.jwtWrapperService.verifyJwtToken(state);

    const payload =
      this.jwtWrapperService.decode<ApplicationRegistrationGithubClaimStateJwtPayload>(
        state,
      );

    if (
      payload.type !==
      JwtTokenTypeEnum.APPLICATION_REGISTRATION_GITHUB_CLAIM_STATE
    ) {
      throw new ApplicationRegistrationException(
        'Invalid claim state token',
        ApplicationRegistrationExceptionCode.GITHUB_AUTH_FAILED,
      );
    }

    return payload;
  }

  async completeGithubClaim(params: {
    statePayload: ApplicationRegistrationGithubClaimStateJwtPayload;
    code: string;
  }): Promise<ApplicationRegistrationEntity> {
    const registration =
      await this.applicationRegistrationService.findOneByIdGlobal(
        params.statePayload.applicationRegistrationId,
      );

    const sourcePackage = this.assertClaimable(registration);

    const publisherLogin = await this.fetchProvenancePublisherLogin({
      packageName: sourcePackage,
      version: registration.latestAvailableVersion,
    });

    const accessToken = await this.exchangeGithubCode(params.code);

    await this.assertGithubOwnership({ accessToken, publisherLogin });

    return this.applicationRegistrationService.claimOwnership({
      applicationRegistrationId: registration.id,
      claimingWorkspaceId: params.statePayload.workspaceId,
    });
  }

  async findWorkspaceById(
    workspaceId: string,
  ): Promise<WorkspaceEntity | null> {
    return this.workspaceRepository.findOne({ where: { id: workspaceId } });
  }

  async findClaimsForRegistration(
    applicationRegistrationId: string,
  ): Promise<AdminApplicationRegistrationClaimDTO[]> {
    const registration =
      await this.applicationRegistrationService.findOneByIdGlobal(
        applicationRegistrationId,
      );

    if (!isDefined(registration.ownerWorkspaceId)) {
      return [];
    }

    const ownerWorkspace = await this.workspaceRepository.findOne({
      where: { id: registration.ownerWorkspaceId },
    });

    return [
      {
        workspaceId: registration.ownerWorkspaceId,
        workspaceDisplayName: ownerWorkspace?.displayName ?? null,
      },
    ];
  }

  private assertClaimable(registration: ApplicationRegistrationEntity): string {
    if (isDefined(registration.ownerWorkspaceId)) {
      throw new ApplicationRegistrationException(
        'Application registration is already owned by a workspace',
        ApplicationRegistrationExceptionCode.APPLICATION_REGISTRATION_ALREADY_OWNED,
      );
    }

    if (
      registration.sourceType !== ApplicationRegistrationSourceType.NPM ||
      !isDefined(registration.sourcePackage)
    ) {
      throw new ApplicationRegistrationException(
        'Only npm-sourced applications can be claimed',
        ApplicationRegistrationExceptionCode.CLAIM_NOT_SUPPORTED,
      );
    }

    return registration.sourcePackage;
  }

  private buildCallbackUrl(): string {
    const serverUrl = this.twentyConfigService.get('SERVER_URL');

    return `${serverUrl}/application-registration-claim/github/callback`;
  }

  private async fetchProvenancePublisherLogin(params: {
    packageName: string;
    version: string | null;
  }): Promise<string> {
    const registryUrl = this.twentyConfigService.get('APP_REGISTRY_URL');
    const version =
      params.version ??
      (await this.fetchLatestVersion(registryUrl, params.packageName));

    // Scoped packages need their slash percent-encoded for the registry path.
    const encodedName = params.packageName.replace(/\//g, '%2F');

    let data: unknown;

    try {
      const response = await axios.get(
        `${registryUrl}/-/npm/v1/attestations/${encodedName}@${version}`,
        {
          headers: { 'User-Agent': 'Twenty-Marketplace' },
          timeout: 10_000,
        },
      );

      data = response.data;
    } catch (error) {
      if (
        axios.isAxiosError(error) &&
        isDefined(error.response) &&
        error.response.status === 404
      ) {
        throw new ApplicationRegistrationException(
          `No provenance attestation found for ${params.packageName}@${version}`,
          ApplicationRegistrationExceptionCode.PROVENANCE_NOT_FOUND,
        );
      }

      this.logger.warn(
        `Failed to fetch attestations for ${params.packageName}@${version}: ${error instanceof Error ? error.message : String(error)}`,
      );

      throw new ApplicationRegistrationException(
        `Could not reach the package registry to verify provenance for ${params.packageName}`,
        ApplicationRegistrationExceptionCode.PROVENANCE_CHECK_UNAVAILABLE,
      );
    }

    const repositoryUrl = this.extractProvenanceRepositoryUrl(data);

    const match = repositoryUrl?.match(
      /(?:^|\/\/|@)github\.com[/:]([^/]+)\/[^/@]+/i,
    );

    if (!isDefined(match)) {
      throw new ApplicationRegistrationException(
        `No GitHub source repository found in the provenance of ${params.packageName}@${version}`,
        ApplicationRegistrationExceptionCode.PROVENANCE_NOT_FOUND,
      );
    }

    return match[1];
  }

  private extractProvenanceRepositoryUrl(data: unknown): string | null {
    const parsed = attestationsResponseSchema.safeParse(data);

    if (!parsed.success) {
      return null;
    }

    for (const attestation of parsed.data.attestations) {
      if (!attestation.predicateType.includes('slsa.dev/provenance')) {
        continue;
      }

      try {
        const payload = provenancePayloadSchema.parse(
          JSON.parse(
            Buffer.from(
              attestation.bundle.dsseEnvelope.payload,
              'base64',
            ).toString('utf-8'),
          ),
        );

        const repository =
          payload.predicate.buildDefinition?.externalParameters?.workflow
            ?.repository ?? payload.predicate.invocation?.configSource?.uri;

        if (isNonEmptyString(repository)) {
          return repository;
        }
      } catch {
        continue;
      }
    }

    return null;
  }

  private async fetchLatestVersion(
    registryUrl: string,
    packageName: string,
  ): Promise<string> {
    const encodedName = packageName.replace(/\//g, '%2F');

    try {
      const { data } = await axios.get(`${registryUrl}/${encodedName}/latest`, {
        headers: { 'User-Agent': 'Twenty-Marketplace' },
        timeout: 10_000,
      });

      const version = z.object({ version: z.string() }).parse(data).version;

      return version;
    } catch {
      throw new ApplicationRegistrationException(
        `Could not resolve the latest published version of ${packageName}`,
        ApplicationRegistrationExceptionCode.PROVENANCE_CHECK_UNAVAILABLE,
      );
    }
  }

  private async exchangeGithubCode(code: string): Promise<string> {
    const clientId = this.twentyConfigService.get('APP_CLAIM_GITHUB_CLIENT_ID');
    const clientSecret = this.twentyConfigService.get(
      'APP_CLAIM_GITHUB_CLIENT_SECRET',
    );

    if (!isNonEmptyString(clientId) || !isNonEmptyString(clientSecret)) {
      throw new ApplicationRegistrationException(
        'GitHub OAuth app is not configured',
        ApplicationRegistrationExceptionCode.CLAIM_NOT_CONFIGURED,
      );
    }

    try {
      const { data } = await axios.post(
        'https://github.com/login/oauth/access_token',
        { client_id: clientId, client_secret: clientSecret, code },
        {
          headers: { Accept: 'application/json' },
          timeout: 10_000,
        },
      );

      const accessToken = z
        .object({ access_token: z.string() })
        .parse(data).access_token;

      return accessToken;
    } catch (error) {
      this.logger.warn(
        `GitHub code exchange failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      throw new ApplicationRegistrationException(
        'GitHub authentication failed',
        ApplicationRegistrationExceptionCode.GITHUB_AUTH_FAILED,
      );
    }
  }

  private async assertGithubOwnership(params: {
    accessToken: string;
    publisherLogin: string;
  }): Promise<void> {
    const headers = {
      Authorization: `Bearer ${params.accessToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Twenty-Marketplace',
    };

    let viewerLogin: string;

    try {
      const { data } = await axios.get('https://api.github.com/user', {
        headers,
        timeout: 10_000,
      });

      viewerLogin = z.object({ login: z.string() }).parse(data).login;
    } catch (error) {
      this.logger.warn(
        `GitHub user lookup failed: ${error instanceof Error ? error.message : String(error)}`,
      );

      throw new ApplicationRegistrationException(
        'GitHub authentication failed',
        ApplicationRegistrationExceptionCode.GITHUB_AUTH_FAILED,
      );
    }

    if (viewerLogin.toLowerCase() === params.publisherLogin.toLowerCase()) {
      return;
    }

    try {
      const { data } = await axios.get(
        `https://api.github.com/user/memberships/orgs/${params.publisherLogin}`,
        { headers, timeout: 10_000 },
      );

      const membership = z
        .object({ state: z.string(), role: z.string() })
        .parse(data);

      if (membership.state === 'active' && membership.role === 'admin') {
        return;
      }
    } catch {
      // 404 means the user is not a member of the organization; fall through
      // to the ownership error below.
    }

    throw new ApplicationRegistrationException(
      `The connected GitHub account is not an owner of ${params.publisherLogin}`,
      ApplicationRegistrationExceptionCode.GITHUB_ORG_OWNERSHIP_REQUIRED,
    );
  }
}
