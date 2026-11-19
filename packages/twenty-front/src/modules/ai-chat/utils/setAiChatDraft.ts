export const setAiChatDraft = ({
  drafts,
  threadId,
  draft,
}: {
  drafts: Record<string, string>;
  threadId: string;
  draft: string;
}): Record<string, string> => {
  if (draft !== '') {
    return { ...drafts, [threadId]: draft };
  }

  if (!(threadId in drafts)) {
    return drafts;
  }

  const { [threadId]: _removedDraft, ...otherDrafts } = drafts;

  return otherDrafts;
};
