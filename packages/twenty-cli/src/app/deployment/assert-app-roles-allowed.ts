import {
  type ApplicationManifestRoleViolation,
  formatApplicationManifestRoleViolation,
  getApplicationManifestRoleViolations,
  type Manifest,
} from 'twenty-shared/application';
import { isArray } from '@sniptt/guards';
import { isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { fetchWorkspaceOrThrow } from '@/app/fetch-workspace-or-throw';
import { isSameUniversalIdentifier } from '@/app/is-same-universal-identifier';
import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';

const hasRoleManifests = (
  manifest: ToolingBuild['manifest'],
): manifest is Pick<Manifest, 'application' | 'roles' | 'agents'> =>
  isPlainObject(manifest.application) &&
  isArray(manifest.roles) &&
  isArray(manifest.agents);

const getRoleViolations = ({ manifest }: ToolingBuild) =>
  hasRoleManifests(manifest)
    ? getApplicationManifestRoleViolations({ manifest })
    : [];

const throwRoleViolations = ({
  build,
  violations,
}: {
  build: ToolingBuild;
  violations: ApplicationManifestRoleViolation[];
}): never => {
  throw new CliError({
    code: 'INVALID_INPUT',
    message: `${build.application.displayName} declares roles a marketplace app cannot declare:\n${violations.map((violation) => `- ${formatApplicationManifestRoleViolation(violation)}`).join('\n')}`,
    hint: 'Keep only the application role and the roles of your agents, without row-level rules or field permissions. The workspace custom app configures those.',
  });
};

export const assertMarketplaceAppRolesOrThrow = ({
  build,
}: {
  build: ToolingBuild;
}): void => {
  const violations = getRoleViolations(build);

  if (isNonEmptyArray(violations)) {
    throwRoleViolations({ build, violations });
  }
};

// The build alone cannot tell the workspace custom app from a marketplace app
export const assertAppRolesAllowedOnTargetOrThrow = async ({
  build,
  target,
  signal,
}: {
  build: ToolingBuild;
  target: ResolvedTarget;
  signal: AbortSignal;
}): Promise<void> => {
  const violations = getRoleViolations(build);

  if (!isNonEmptyArray(violations)) {
    return;
  }

  const workspace = await fetchWorkspaceOrThrow({
    target,
    signal,
    shouldIncludeCustomApplication: true,
  });

  if (
    !isSameUniversalIdentifier({
      value: workspace.workspaceCustomApplication?.universalIdentifier,
      universalIdentifier: build.application.universalIdentifier,
    })
  ) {
    throwRoleViolations({ build, violations });
  }
};
