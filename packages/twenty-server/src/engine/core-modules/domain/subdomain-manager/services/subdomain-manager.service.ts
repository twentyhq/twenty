import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import {
  capitalize,
  getSubdomainSlugFromDisplayName,
  isDefined,
} from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { type SubdomainAvailabilityDTO } from 'src/engine/core-modules/domain/subdomain-manager/dtos/subdomain-availability.dto';
import { type WorkspaceCreationDefaultsDTO } from 'src/engine/core-modules/domain/subdomain-manager/dtos/workspace-creation-defaults.dto';
import { generateRandomSubdomain } from 'src/engine/core-modules/domain/subdomain-manager/utils/generate-random-subdomain.util';
import { getSubdomainFromEmail } from 'src/engine/core-modules/domain/subdomain-manager/utils/get-subdomain-from-email.util';
import { isSubdomainValid } from 'src/engine/core-modules/domain/subdomain-manager/utils/is-subdomain-valid.util';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  WorkspaceException,
  WorkspaceExceptionCode,
} from 'src/engine/core-modules/workspace/workspace.exception';

const SUBDOMAIN_MAX_LENGTH = 30;
const MAX_NUMBERED_SUFFIX_ATTEMPTS = 50;
const MAX_RANDOM_FALLBACK_ATTEMPTS = 10;

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
    // findAvailableSubdomain normalizes its input and falls back to a random
    // subdomain when no valid base can be derived, so pass the raw extraction.
    const extractedSubdomain =
      getSubdomainFromEmail(userEmail) ||
      getSubdomainSlugFromDisplayName(workspaceDisplayName);

    return this.findAvailableSubdomain(extractedSubdomain ?? '');
  }

  // Suggests workspace creation defaults from a work email (e.g. jane@acme.com
  // -> { displayName: 'Acme', subdomain: 'acme' }); empty for personal emails.
  async getWorkspaceCreationDefaults(
    email?: string,
  ): Promise<WorkspaceCreationDefaultsDTO> {
    const subdomainBase = getSubdomainFromEmail(email);

    if (!isDefined(subdomainBase)) {
      return { displayName: '', subdomain: '' };
    }

    return {
      displayName: capitalize(subdomainBase),
      subdomain: await this.findAvailableSubdomain(subdomainBase),
    };
  }

  async findAvailableSubdomain(desired: string): Promise<string> {
    const derivedBase = isSubdomainValid(desired)
      ? desired
      : getSubdomainSlugFromDisplayName(desired);

    const base =
      isDefined(derivedBase) && isSubdomainValid(derivedBase)
        ? derivedBase
        : generateRandomSubdomain();

    if (await this.isSubdomainFreeToUse(base)) {
      return base;
    }

    for (let suffix = 2; suffix <= MAX_NUMBERED_SUFFIX_ATTEMPTS; suffix++) {
      const candidate = this.appendNumberedSuffix(base, suffix);

      if (await this.isSubdomainFreeToUse(candidate)) {
        return candidate;
      }
    }

    for (let attempt = 0; attempt < MAX_RANDOM_FALLBACK_ATTEMPTS; attempt++) {
      const candidate = generateRandomSubdomain();

      if (await this.isSubdomainFreeToUse(candidate)) {
        return candidate;
      }
    }

    return generateRandomSubdomain();
  }

  async getSubdomainAvailability(
    subdomain: string,
  ): Promise<SubdomainAvailabilityDTO> {
    const isValid = isSubdomainValid(subdomain);
    const available = isValid && (await this.isSubdomainFreeToUse(subdomain));

    // Only spend the extra DB lookups deriving an alternative when the input is
    // a valid-but-taken subdomain; for an available or invalid input there is
    // nothing useful to suggest (the client surfaces the validation error).
    const suggestedSubdomain =
      isValid && !available
        ? await this.findAvailableSubdomain(subdomain)
        : subdomain;

    return { isValid, available, suggestedSubdomain };
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

  private async isSubdomainFreeToUse(subdomain: string): Promise<boolean> {
    return (
      isSubdomainValid(subdomain) &&
      this.twentyConfigService.get('DEFAULT_SUBDOMAIN') !== subdomain &&
      (await this.isSubdomainAvailable(subdomain))
    );
  }

  private appendNumberedSuffix(base: string, suffix: number): string {
    const suffixPart = `-${suffix}`;
    const maxBaseLength = SUBDOMAIN_MAX_LENGTH - suffixPart.length;
    const trimmedBase =
      base.length > maxBaseLength
        ? base.slice(0, maxBaseLength).replace(/-+$/g, '')
        : base;

    return `${trimmedBase}${suffixPart}`;
  }
}
