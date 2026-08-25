import type { CoreApiClient } from 'twenty-client-sdk/core';

export async function createPreReviewNote(
  client: CoreApiClient,
  {
    partnerId,
    title,
    markdown,
  }: { partnerId: string; title: string; markdown: string },
): Promise<string> {
  const created = await client.mutation({
    createNote: {
      __args: { data: { title, bodyV2: { markdown, blocknote: null } } },
      id: true,
    },
  });

  const noteId = created.createNote.id;

  // partner is a custom object, so its noteTarget reverse relation is generated
  // as targetPartner / targetPartnerId.
  await client.mutation({
    createNoteTarget: {
      __args: { data: { noteId, targetPartnerId: partnerId } },
      id: true,
    },
  });

  return noteId;
}
