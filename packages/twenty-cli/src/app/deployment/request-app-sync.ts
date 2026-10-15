import { type ToolingBuild } from '@/app/types/tooling-result.type';
import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const requestAppSync = async ({
  build,
  inferDeletionFromMissingEntities,
  target,
  signal,
  dryRun = false,
}: {
  build: ToolingBuild;
  inferDeletionFromMissingEntities: boolean;
  target: ResolvedTarget;
  signal: AbortSignal;
  dryRun?: boolean;
}) => {
  const client = createMetadataClient({ target, signal });

  return client.mutation({
    __name: dryRun ? 'PreviewApplication' : 'SyncApplication',
    syncApplication: {
      __args: {
        manifest: build.manifest,
        inferDeletionFromMissingEntities,
        ...(dryRun ? { dryRun: true } : {}),
      },
      applicationUniversalIdentifier: true,
      actions: true,
      translationActions: true,
    },
  });
};
