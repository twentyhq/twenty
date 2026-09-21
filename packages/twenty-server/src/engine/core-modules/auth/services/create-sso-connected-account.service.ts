import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { type ConnectedAccountProvider } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { UserWorkspaceEntity } from 'src/engine/core-modules/user-workspace/user-workspace.entity';
import { ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

type CreateSsoConnectedAccountParams = {
  workspaceId: string;
  userId: string;
  handle: string;
  provider: ConnectedAccountProvider;
  scopes: string[];
  oidcTokenClaims?: Record<string, unknown>;
};

@Injectable()
export class CreateSsoConnectedAccountService {
  private readonly logger = new Logger(CreateSsoConnectedAccountService.name);

  constructor(
    @InjectRepository(ConnectedAccountEntity)
    private readonly connectedAccountRepository: Repository<ConnectedAccountEntity>,
    @InjectRepository(UserWorkspaceEntity)
    private readonly userWorkspaceRepository: Repository<UserWorkspaceEntity>,
  ) {}

  async createOrUpdateSsoConnectedAccount(
    params: CreateSsoConnectedAccountParams,
  ): Promise<void> {
    const { workspaceId, userId, handle, provider, scopes, oidcTokenClaims } =
      params;

    const userWorkspace = await this.userWorkspaceRepository.findOneBy({
      userId,
      workspaceId,
    });

    if (!userWorkspace) {
      this.logger.warn(
        `Could not find userWorkspace for userId=${userId} workspaceId=${workspaceId}, skipping SSO connected account creation`,
      );

      return;
    }

    const existing = await this.connectedAccountRepository.findOneBy({
      handle,
      provider,
      userWorkspaceId: userWorkspace.id,
      workspaceId,
    });

    if (existing) {
      const mergedScopes = Array.from(
        new Set([...(existing.scopes ?? []), ...scopes]),
      );

      await this.connectedAccountRepository.update(existing.id, {
        lastSignedInAt: new Date(),
        provider,
        scopes: mergedScopes,
        ...(oidcTokenClaims !== undefined
          ? { oidcTokenClaims: oidcTokenClaims as object }
          : {}),
      });

      return;
    }

    await this.connectedAccountRepository.save({
      handle,
      provider,
      scopes,
      accessToken: null,
      refreshToken: null,
      lastSignedInAt: new Date(),
      userWorkspaceId: userWorkspace.id,
      workspaceId,
      ...(oidcTokenClaims ? { oidcTokenClaims } : {}),
    });
  }
}
