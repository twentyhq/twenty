// The fair-use ceiling is a per-UTC-day quota, so included chat resumes at the next UTC midnight
export const getAiChatIncludedChatResumeDate = (now: Date): Date =>
  new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );
