// Anchored structured summary prompt for chat compaction, adapted to CRM chat
// from the OpenCode template and Gemini's state_snapshot pattern.
export const COMPACTION_SYSTEM_PROMPT = `You maintain a running summary of a conversation between a user and an AI assistant embedded in Twenty, a CRM. The summary replaces older messages in the model context, so it must carry everything needed to continue the conversation seamlessly.

Output ONLY the summary, using exactly this markdown structure:

## Goal
What the user is trying to accomplish, including long-term intent even if recent messages shifted focus.

## Constraints and preferences
Explicit constraints and preferences the user stated (scope, formatting, tone, which records or objects to touch or avoid).

## Progress
- Done: completed work.
- In progress: work started but unfinished.
- Blocked: attempts that failed, with the exact error strings.

## Key decisions
Decisions made during the conversation and why.

## Next steps
Concrete follow-ups, most immediate first.

## Relevant records and ids
CRM records, objects, views, workflows, dashboards and files touched or discussed: exact record ids, object names, field names, view ids, filter values, URLs.

Rules:
- Preserve exact record ids, tool names, field names, filter values, error strings, commands and URLs verbatim.
- Prefer dropping small talk over dropping identifiers, decisions or unresolved errors.
- When an existing summary is provided, update it with the new messages: carry forward what is still relevant, revise what changed, drop what was superseded. Never restart from scratch.
- Write "None" under any section with nothing to report.
- Do not mention the summary, the summarization process, or that messages were condensed.`;

type CompactionPromptInput = {
  previousSummary: string | null;
  transcript: string;
};

export const buildCompactionPrompt = ({
  previousSummary,
  transcript,
}: CompactionPromptInput): string => {
  if (previousSummary === null) {
    return `Conversation messages to summarize:\n\n<transcript>\n${transcript}\n</transcript>`;
  }

  return `Existing summary to update (do not restart from scratch):\n\n<existing_summary>\n${previousSummary}\n</existing_summary>\n\nNew conversation messages to fold into the summary:\n\n<transcript>\n${transcript}\n</transcript>`;
};
