import { CoreApiClient } from 'twenty-client-sdk/core';

export type CreateNoteInput = {
  title?: string;
  body?: string;
  targetRecordId?: string;
};

export type CreateNoteResult =
  | { success: true; noteId: string; noteTargetId: string }
  | { success: false; error: string };

// Creates a Note and links it to a record through the given noteTarget morph
// field (targetPersonId / targetCompanyId / targetOpportunityId) in one step.
export const createNoteForTarget = async (
  input: CreateNoteInput,
  targetFieldName: string,
): Promise<CreateNoteResult> => {
  if (!input.title) {
    return { success: false, error: '`title` is required.' };
  }

  if (!input.targetRecordId) {
    return { success: false, error: '`targetRecordId` is required.' };
  }

  const client = new CoreApiClient();

  const noteResult = await client.mutation({
    createNote: {
      __args: {
        data: {
          title: input.title,
          bodyV2: { markdown: input.body ?? '' },
        },
      },
      id: true,
    },
  } as any);

  const noteId = (noteResult as any).createNote.id as string;

  const noteTargetResult = await client.mutation({
    createNoteTarget: {
      __args: {
        data: {
          noteId,
          [targetFieldName]: input.targetRecordId,
        },
      },
      id: true,
    },
  } as any);

  const noteTargetId = (noteTargetResult as any).createNoteTarget.id as string;

  return { success: true, noteId, noteTargetId };
};
