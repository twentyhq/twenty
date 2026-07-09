import { type SummarizeTarget } from 'src/front-components/utils/summarize-target';

// The prompt is what the user sees sent in the Ask AI chat, so it stays short
// and human-readable; the record id lets the agent resolve the record even
// when the chat is opened from a list view.
export const buildSummarizePrompt = ({
  target,
  recordLabel,
  recordId,
}: {
  target: SummarizeTarget;
  recordLabel: string | null;
  recordId: string;
}): string => {
  if (recordLabel !== null && recordLabel.trim().length > 0) {
    return `Summarize what you know about the ${target.label} "${recordLabel.trim()}" (record id: ${recordId}).`;
  }

  return `Summarize what you know about the ${target.label} with record id ${recordId}.`;
};
