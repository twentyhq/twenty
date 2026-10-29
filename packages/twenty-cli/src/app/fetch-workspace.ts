import { isNonEmptyString } from '@sniptt/guards';
import { isValidUniversalIdentifier } from 'twenty-shared/application';
import { isDefined, isPlainObject, isValidUuid } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const fetchWorkspace = async ({
  target,
  signal,
  shouldIncludeCustomApplication = false,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
  shouldIncludeCustomApplication?: boolean;
}) => {
  const client = createMetadataClient({ target, signal });
  const data = await client.query({
    currentWorkspace: {
      id: true,
      ...(shouldIncludeCustomApplication
        ? { workspaceCustomApplication: { universalIdentifier: true } }
        : {}),
    },
  });
  const workspace = data?.currentWorkspace;

  if (
    !isPlainObject(workspace) ||
    !isNonEmptyString(workspace.id) ||
    !isValidUuid(workspace.id)
  ) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: `${target.apiUrl} did not say which workspace these credentials belong to.`,
    });
  }

  if (
    shouldIncludeCustomApplication &&
    isDefined(workspace.workspaceCustomApplication) &&
    (!isPlainObject(workspace.workspaceCustomApplication) ||
      !isNonEmptyString(
        workspace.workspaceCustomApplication.universalIdentifier,
      ) ||
      !isValidUniversalIdentifier(
        workspace.workspaceCustomApplication.universalIdentifier,
      ))
  ) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: `${target.apiUrl} returned an invalid workspace custom application identifier.`,
    });
  }

  return workspace;
};
