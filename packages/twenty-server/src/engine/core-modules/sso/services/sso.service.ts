import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { WorkspaceSSOIdentityProvider } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';

@Injectable()
// eslint-disable-next-line @nx/workspace-inject-workspace-repository
export class SSOService {
  constructor(
    @InjectRepository(WorkspaceSSOIdentityProvider, 'core')
    private readonly workspaceSSOIdentityProviderRepository: Repository<WorkspaceSSOIdentityProvider>,
  ) {}

  async createSSOIdentityProvider(data: SSOConfiguration, workspaceId: string) {
    const idp = await this.workspaceSSOIdentityProviderRepository.save({
      ...data,
      workspaceId,
    });

    return {
      id: idp.id,
      type: idp.type,
    };
  }
}
