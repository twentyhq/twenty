import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { type ArchiveInboxThreadInput } from 'twenty-shared/application';

export const archiveInboxThread = async (
  input: ArchiveInboxThreadInput,
): Promise<void> => {
  const client = new MetadataApiClient();

  await client.mutation({
    archiveInboxThread: { __args: { input } },
  });
};
