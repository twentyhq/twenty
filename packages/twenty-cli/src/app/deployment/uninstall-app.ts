import { createAppNotInstalledError } from '@/app/create-app-not-installed-error';
import { isApplicationNotFoundError } from '@/app/is-application-not-found-error';
import { CliError } from '@/output/cli-error';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const uninstallApp = async ({
  universalIdentifier,
  target,
  signal,
}: {
  universalIdentifier: string;
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  const data = await createMetadataClient({ target, signal })
    .mutation({
      __name: 'UninstallApplication',
      uninstallApplication: { __args: { universalIdentifier } },
    })
    .catch((error: unknown) => {
      if (
        isApplicationNotFoundError({ error, field: 'uninstallApplication' })
      ) {
        throw createAppNotInstalledError({
          universalIdentifier,
          apiUrl: target.apiUrl,
        });
      }

      throw error;
    });

  if (data?.uninstallApplication !== true) {
    throw new CliError({
      code: 'INVALID_RESPONSE',
      message: `The server did not confirm the uninstall of ${universalIdentifier}.`,
    });
  }
};
