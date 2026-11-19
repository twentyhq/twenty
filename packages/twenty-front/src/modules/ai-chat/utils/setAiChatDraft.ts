import { isNonEmptyString } from '@sniptt/guards';

export const setAiChatDraft = ({
  drafts,
  threadId,
  draft,
}: {
  drafts: Record<string, string>;
  threadId: string;
  draft: string;
}): Record<string, string> => {
  if (isNonEmptyString(draft)) {
    return { ...drafts, [threadId]: draft };
  }

  if (!(threadId in drafts)) {
    return drafts;
  }

  const { [threadId]: _removedDraft, ...otherDrafts } = drafts;

  return otherDrafts;
};
