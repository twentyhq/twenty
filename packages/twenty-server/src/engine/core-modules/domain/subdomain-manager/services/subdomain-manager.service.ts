import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { generateRandomSubdomain } from 'src/engine/core-modules/domain/subdomain-manager/utils/generate-random-subdomain.util';
import { getSubdomainFromEmail } from 'src/engine/core-modules/domain/subdomain-manager/utils/get-subdomain-from-email.util';
import { getSubdomainNameFromDisplayName } from 'src/engine/core-modules/domain/subdomain-manager/utils/get-subdomain-name-from-display-name.util';
import { isSubdomainValid } from 'src/engine/core-modules/domain/subdomain-manager/utils/is-subdomain-valid.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';

@Injectable()
export class SubdomainManagerService {
  constructor(
    @InjectRepository(WorkspaceEntity)
    private readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly twentyConfigService: TwentyConfigService,
  ) {}

  async generateSubdomain({
    userEmail,
    workspaceDisplayName,
  }: {
    userEmail?: string;
    workspaceDisplayName?: string;
  }) {
    const subdomainFromUserEmail = getSubdomainFromEmail(userEmail);
    const subdomainFromWorkspaceDisplayName =
      getSubdomainNameFromDisplayName(workspaceDisplayName);

    const extractedSubdomain =
      subdomainFromUserEmail || subdomainFromWorkspaceDisplayName;

    const isExtractedSubdomainValid = isDefined(extractedSubdomain)
      ? isSubdomainValid(extractedSubdomain)
      : false;

    const subdomain = isExtractedSubdomainValid
      ? extractedSubdomain
      : generateRandomSubdomain();

    const existingWorkspaceCount = await this.workspaceRepository.count({
      where: { subdomain },
      withDeleted: true,
    });

    return `${subdomain}${existingWorkspaceCount > 0 ? `-${Math.random().toString(36).substring(2, 10)}` : ''}`;
  }

  async isSubdomainAvailable(subdomain: string) {
    const existingWorkspace = await this.workspaceRepository.findOne({
      where: { subdomain: subdomain },
      withDeleted: true,
    });

    return !existingWorkspace;
  }

  async validateSubdomainOrThrow(subdomain: string) {
    const isValid = isSubdomainValid(subdomain);

    if (!isValid) {
      throw new WorkspaceException(
        'Subdomain is not valid',
        WorkspaceExceptionCode.SUBDOMAIN_NOT_VALID,
      );
    }

    const isAvailable = await this.isSubdomainAvailable(subdomain);

    if (
      !isAvailable ||
      this.twentyConfigService.get('DEFAULT_SUBDOMAIN') === subdomain
    ) {
      throw new WorkspaceException(
        'Subdomain already taken',
        WorkspaceExceptionCode.SUBDOMAIN_ALREADY_TAKEN,
      );
    }
  }
}
