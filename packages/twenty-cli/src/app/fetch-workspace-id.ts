import { isNonEmptyString } from '@sniptt/guards';
import { isPlainObject, isValidUuid } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const fetchWorkspaceId = async ({
  target,
  signal,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  const client = createMetadataClient({ target, signal });
  const { currentWorkspace: workspace } = await client.query({
    currentWorkspace: { id: true },
  });

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

  return workspace.id;
};
