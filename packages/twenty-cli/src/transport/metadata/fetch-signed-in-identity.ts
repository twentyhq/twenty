import { type ResolvedTarget } from '@/target/types/resolved-target.type';
import { createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const fetchSignedInIdentity = async ({
  target,
  signal,
}: {
  target: ResolvedTarget;
  signal: AbortSignal;
}) => {
  const client = createMetadataClient({ target, signal });

  if (target.credentialKind === 'apiKey') {
    const { currentWorkspace } = await client.query({
      currentWorkspace: { displayName: true },
    });

    return { workspaceName: currentWorkspace.displayName ?? null, email: null };
  }

  const { currentWorkspace, currentUser } = await client.query({
    currentWorkspace: { displayName: true },
    currentUser: { email: true },
  });

  return {
    workspaceName: currentWorkspace.displayName ?? null,
    email: currentUser.email,
  };
};
