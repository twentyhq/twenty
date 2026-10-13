export type TeamsAssistantAnswerResult =
  | { status: 'answered' }
  | { status: 'declined'; reason: string }
  | { status: 'skipped'; reason: string }
  | { status: 'failed'; reason: string };
