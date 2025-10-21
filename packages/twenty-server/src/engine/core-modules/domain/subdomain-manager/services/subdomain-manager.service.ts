import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { generateRandomSubdomain } from 'src/engine/core-modules/domain/subdomain-manager/utils/generate-random-subdomain';
import { getSubdomainFromEmail } from 'src/engine/core-modules/domain/subdomain-manager/utils/get-subdomain-from-email';
import { getSubdomainNameFromDisplayName } from 'src/engine/core-modules/domain/subdomain-manager/utils/get-subdomain-name-from-display-name';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { RESERVED_SUBDOMAINS } from 'src/engine/core-modules/workspace/constants/reserved-subdomains.constant';
import { VALID_SUBDOMAIN_PATTERN } from 'src/engine/core-modules/workspace/constants/valid-subdomain-pattern.constant';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';

@Injectable()
export class SubdomainManagerService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  private extractSubdomain(params?: { email?: string; displayName?: string }) {
    if (params?.email) {
      return getSubdomainFromEmail(params.email);
    }

    if (params?.displayName) {
      return getSubdomainNameFromDisplayName(params.displayName);
    }
  }

  async generateSubdomain(params?: { email?: string; displayName?: string }) {
    let subdomain = this.extractSubdomain(params);

    if (
      subdomain &&
      (!VALID_SUBDOMAIN_PATTERN.test(subdomain) ||
        RESERVED_SUBDOMAINS.includes(subdomain))
    ) {
      subdomain = undefined;
    }

    subdomain = subdomain ?? generateRandomSubdomain();

    const existingWorkspaceCount = await this.workspaceRepository.countBy({
      subdomain,
    });

    return `${subdomain}${existingWorkspaceCount > 0 ? `-${Math.random().toString(36).substring(2, 10)}` : ''}`;
  }

  async isSubdomainAvailable(subdomain: string) {
    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { subdomain: subdomain },
    });

    return !existingWorkspace;
  }

  async validateSubdomainUpdate(newSubdomain: string) {
    if (!VALID_SUBDOMAIN_PATTERN.test(newSubdomain)) {
      throw new WorkspaceException(
        'Subdomain is reserved',
        WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN,
      );
    }

    if (RESERVED_SUBDOMAINS.includes(newSubdomain.toLowerCase())) {
      throw new WorkspaceException(
        'Subdomain is reserved',
        WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN,
      );
    }

    const subdomainAvailable = await this.isSubdomainAvailable(newSubdomain);

    if (
      !subdomainAvailable ||
      this.twentyConfigService.get('DEFAULT_SUBDOMAIN') === newSubdomain
    ) {
      throw new WorkspaceException(
        'Subdomain already taken',
        WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN,
      );
    }
  }
}
