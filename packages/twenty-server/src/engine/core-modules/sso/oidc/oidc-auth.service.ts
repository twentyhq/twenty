import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { OidcIdentityProviderEntity } from './oidc-auth.entity';

@Injectable()
export class OidcAuthService {
  constructor(
    @InjectRepository(OidcIdentityProviderEntity)
    private readonly oidcRepo: Repository<OidcIdentityProviderEntity>,
  ) {}

  async createOidcProvider(
    workspaceId: string,
    data: Partial<OidcIdentityProviderEntity>,
  ): Promise<OidcIdentityProviderEntity> {
    const provider = this.oidcRepo.create({
      ...data,
      workspaceId,
    });
    return this.oidcRepo.save(provider);
  }

  async findByWorkspace(workspaceId: string): Promise<OidcIdentityProviderEntity[]> {
    return this.oidcRepo.find({
      where: { workspaceId, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'ASC' },
    });
  }

  async findDefault(workspaceId: string): Promise<OidcIdentityProviderEntity | null> {
    return this.oidcRepo.findOne({
      where: { workspaceId, isActive: true, isDefault: true },
    });
  }

  async updateProvider(
    id: string,
    data: Partial<OidcIdentityProviderEntity>,
  ): Promise<OidcIdentityProviderEntity> {
    await this.oidcRepo.update(id, data);
    return this.oidcRepo.findOneBy({ id });
  }

  async setDefault(workspaceId: string, providerId: string): Promise<void> {
    await this.oidcRepo.update(
      { workspaceId },
      { isDefault: false },
    );
    await this.oidcRepo.update(
      { id: providerId, workspaceId },
      { isDefault: true },
    );
  }

  async deleteProvider(id: string, workspaceId: string): Promise<void> {
    await this.oidcRepo.delete({ id, workspaceId });
  }

  getAuthorizationUrl(provider: OidcIdentityProviderEntity, redirectUri: string, state: string): string {
    const params = new URLSearchParams({
      client_id: provider.clientId || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: provider.scope || 'openid profile email',
      state,
    });
    return `${provider.authorizationUrl}?${params.toString()}`;
  }

  async exchangeCodeForTokens(
    provider: OidcIdentityProviderEntity,
    code: string,
    redirectUri: string,
  ): Promise<{ access_token: string; id_token: string; refresh_token?: string }> {
    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: provider.clientId || '',
      client_secret: provider.clientSecret || '',
      redirect_uri: redirectUri,
    });

    const response = await fetch(provider.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!response.ok) {
      throw new Error(`OIDC token exchange failed: ${response.statusText}`);
    }

    return response.json();
  }
}