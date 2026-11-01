import { MetadataApiClient } from 'twenty-client-sdk/metadata';
import { type InboxThreadRecordInput } from 'twenty-shared/application';

export const attachRecordToInboxThread = async (
  input: InboxThreadRecordInput,
): Promise<void> => {
  const client = new MetadataApiClient();

  await client.mutation({
    attachRecordToInboxThread: { __args: { input } },
  });
};
