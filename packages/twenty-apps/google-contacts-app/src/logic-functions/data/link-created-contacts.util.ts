import { CoreApiClient } from 'twenty-client-sdk/core';

import { chunk } from 'src/logic-functions/data/chunk.util';
import { executeWithRetry } from 'src/logic-functions/data/execute-with-retry.util';
import { describeError } from 'src/logic-functions/data/describe-error.util';
import { type CreatedContact } from 'src/logic-functions/types/contact-write.type';
import { BATCH_SIZE } from 'src/constants/batch-sizes.constant';

const toPersonLink = (
  createdContact: CreatedContact,
): { id: string; googleContactsId: string } => ({
  id: createdContact.personId,
  googleContactsId: createdContact.resourceName.replace('people/', ''),
});

const linkCreatedContactsOneByOne = async ({
  client,
  createdContacts,
}: {
  client: CoreApiClient;
  createdContacts: CreatedContact[];
}): Promise<void> => {
  for (const createdContact of createdContacts) {
    const { id, googleContactsId } = toPersonLink(createdContact);

    try {
      await executeWithRetry(() =>
        client.mutation({
          updatePerson: {
            __args: { id, data: { googleContactsId } },
            id: true,
          },
        }),
      );
    } catch (error) {
      console.error(
        '[google-contacts] Failed to link a created contact',
        id,
        googleContactsId,
        describeError(error),
      );
    }
  }
};

export const linkCreatedContacts = async ({
  client,
  createdContacts,
}: {
  client: CoreApiClient;
  createdContacts: CreatedContact[];
}): Promise<void> => {
  for (const batch of chunk(createdContacts, BATCH_SIZE)) {
    try {
      await executeWithRetry(() =>
        client.mutation({
          createPeople: {
            __args: { data: batch.map(toPersonLink), upsert: true },
            id: true,
          },
        }),
      );
    } catch (error) {
      // googleContactsId is unique, so one contact already linked to another
      // person fails the whole upsert.
      console.error(
        '[google-contacts] Failed to link a batch of created contacts',
        describeError(error),
      );

      await linkCreatedContactsOneByOne({ client, createdContacts: batch });
    }
  }
};
