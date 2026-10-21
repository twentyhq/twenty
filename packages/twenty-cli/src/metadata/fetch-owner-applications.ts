import { CliError } from '@/output/cli-error';
import { type createMetadataClient } from '@/transport/metadata/create-metadata-client';

export const fetchOwnerApplications = async (
  client: ReturnType<typeof createMetadataClient>,
) => {
  try {
    const { findManyApplications } = await client.query({
      findManyApplications: { id: true, name: true, universalIdentifier: true },
    });

    return { applications: findManyApplications, areOwnersNamed: true };
  } catch (error) {
    if (!(error instanceof CliError) || error.code !== 'PERMISSION_DENIED') {
      throw error;
    }

    return { applications: [], areOwnersNamed: false };
  }
};
