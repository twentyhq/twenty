import { Injectable } from '@nestjs/common';

import { isNonEmptyString } from '@sniptt/guards';
import { type Request } from 'express';
import { isDefined } from 'twenty-shared/utils';

import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { resolveAllowedCredentialedOrigins } from 'src/engine/core-modules/user-session/utils/resolve-allowed-credentialed-origins.util';
import { getRequestBaseUrl } from 'src/utils/get-request-base-url.util';

// Workspace lookups are DB reads on the request path (CORS, CSRF, cookie
// issuance), so verdicts are memoized briefly. The TTL is short enough that a
// freshly created workspace becomes reachable without a restart.
const WORKSPACE_ORIGIN_VERDICT_TTL_MS = 10_000;
const WORKSPACE_ORIGIN_VERDICT_MAX_ENTRIES = 1_000;

// Opaque schemes (file:, data:) serialise to the literal "null" origin, which
// must never compare equal to anything.
const toComparableOrigin = (value: string): string | undefined => {
  try {
    const url = new URL(value);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return undefined;
    }

    return url.origin.toLowerCase();
  } catch {
    return undefined;
  }
};

// Decides which origins may send credentialed cross-origin requests. Shared by
// the CORS reflection, the CSRF middleware and the cookie-issuance gate so the
// three can never disagree about the same origin.
@Injectable()
export class CredentialedOriginService {
  private readonly workspaceOriginVerdicts = new Map<
    string,
    { allowed: boolean; expiresAt: number }
  >();

  constructor(
    private readonly twentyConfigService: TwentyConfigService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {}

  async isOriginAllowed(origin: string): Promise<boolean> {
    const comparableOrigin = toComparableOrigin(origin);

    if (!isNonEmptyString(comparableOrigin)) {
      return false;
    }

    if (
      resolveAllowedCredentialedOrigins(this.twentyConfigService).has(
        comparableOrigin,
      )
    ) {
      return true;
    }

    // Single-workspace deployments serve the front on FRONTEND_URL only, which
    // the static allowlist already covers.
    if (!this.twentyConfigService.get('IS_MULTIWORKSPACE_ENABLED')) {
      return false;
    }

    return await this.isExistingWorkspaceOrigin(comparableOrigin);
  }

  async isRequestOriginAllowed({
    origin,
    request,
  }: {
    origin: string;
    request: Request;
  }): Promise<boolean> {
    // Compared through URL rather than as strings: browsers omit :443 and :80
    // from Origin while Host keeps whatever port the client spelled, so a
    // genuine same-origin POST would otherwise 403 on the port alone.
    const comparableOrigin = toComparableOrigin(origin);
    const comparableRequestOrigin = toComparableOrigin(
      getRequestBaseUrl(request),
    );

    if (
      isDefined(comparableOrigin) &&
      comparableOrigin === comparableRequestOrigin
    ) {
      return true;
    }

    return await this.isOriginAllowed(origin);
  }

  private async isExistingWorkspaceOrigin(
    comparableOrigin: string,
  ): Promise<boolean> {
    const cachedVerdict = this.workspaceOriginVerdicts.get(comparableOrigin);

    if (isDefined(cachedVerdict) && cachedVerdict.expiresAt > Date.now()) {
      return cachedVerdict.allowed;
    }

    const allowed = await this.matchesWorkspaceFrontOrigin(comparableOrigin);

    if (
      this.workspaceOriginVerdicts.size >= WORKSPACE_ORIGIN_VERDICT_MAX_ENTRIES
    ) {
      this.workspaceOriginVerdicts.clear();
    }

    this.workspaceOriginVerdicts.set(comparableOrigin, {
      allowed,
      expiresAt: Date.now() + WORKSPACE_ORIGIN_VERDICT_TTL_MS,
    });

    return allowed;
  }

  private async matchesWorkspaceFrontOrigin(
    comparableOrigin: string,
  ): Promise<boolean> {
    try {
      const { workspace } =
        await this.workspaceDomainsService.resolveWorkspaceAndPublicDomain(
          comparableOrigin,
        );

      if (!isDefined(workspace)) {
        return false;
      }

      const { customUrl, subdomainUrl } =
        this.workspaceDomainsService.getWorkspaceUrls(workspace);

      // Exact origin equality keeps protocol and port strict, and keeps
      // public-domain origins (which resolve a workspace but serve public
      // functions) out of the credentialed set.
      return [customUrl, subdomainUrl]
        .filter(isNonEmptyString)
        .some(
          (workspaceUrl) =>
            toComparableOrigin(workspaceUrl) === comparableOrigin,
        );
    } catch {
      // Fail closed: an unresolvable origin gets no credentialed treatment.
      return false;
    }
  }
}
