export type TelegramAssistantRunOutcome =
  | { status: 'RUNNING' }
  | { status: 'COMPLETED'; responseText: string }
  | { status: 'FAILED'; errorMessage: string };
